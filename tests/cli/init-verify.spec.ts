// The CLI is exercised as a **subprocess** (seam S1), so this spec runs in the
// node environment: the commands touch the filesystem and spawn processes.
// @vitest-environment node

import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Seam S1 — the `ssg` CLI boundary.
 *
 * The CLI is invoked as a real subprocess against a temp directory, because
 * every interesting property here (exit codes, generated files, refusal to
 * overwrite) only exists at that boundary. Calling the command functions in
 * process would not prove the exit codes an agent or CI actually depends on.
 */

const cli = resolve(
  fileURLToPath(
    new URL('../../packages/simple-site-generator/dist/cli.js', import.meta.url)
  )
)

async function run(
  args: string[],
  cwd: string
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((done) => {
    execFile(
      process.execPath,
      [cli, ...args],
      { cwd },
      (error, stdout, stderr) => {
        const code =
          error && typeof (error as { code?: number }).code === 'number'
            ? ((error as { code?: number }).code ?? 1)
            : error
              ? 1
              : 0

        done({ code, stdout, stderr })
      }
    )
  })
}

let workspace: string

beforeAll(async () => {
  workspace = await mkdtemp(join(tmpdir(), 'ssg-cli-'))
})

afterAll(async () => {
  await rm(workspace, { recursive: true, force: true })
})

describe('ssg --help', () => {
  it('lists every command the agent instructions reference', async () => {
    const { code, stdout } = await run(['--help'], workspace)

    expect(code).toBe(0)
    for (const command of ['init', 'add-page', 'check', 'build', 'verify']) {
      expect(stdout).toContain(command)
    }
  })
})

describe('ssg init', () => {
  const target = () => join(workspace, 'site')

  it('scaffolds a project non-interactively', async () => {
    const { code, stdout } = await run(
      [
        'init',
        target(),
        '--template',
        'landing',
        '--site-name',
        'Acme',
        '--yes'
      ],
      workspace
    )

    expect(code).toBe(0)
    expect(stdout).toContain('Created landing site')

    // The files a usable project needs.
    for (const file of [
      'package.json',
      'tsconfig.json',
      'vitrify.config.ts',
      'src/pages',
      'src/router/routes.ts',
      'public/robots.txt'
    ]) {
      await expect(fs.access(join(target(), file))).resolves.toBeUndefined()
    }
  })

  it('names the landing component only on a landing site', async () => {
    // The scaffold's home page used to hardcode `page: Landing` whatever template
    // was chosen. Only the `landing` module exports a `Landing`, so a `business`
    // or `docs` site named a component that does not exist — and the router fell
    // back to `Page` and silently rendered the wrong home page. That is a build
    // failure now, so the scaffold itself has to be right.
    const read = (dir: string) =>
      fs.readFile(join(workspace, dir, 'src/pages/Index.md'), 'utf8')

    for (const [template, expected] of [
      ['landing', /^page: Landing$/m],
      ['business', null],
      ['docs', null]
    ] as const) {
      const dir = `site-${template}`
      const { code } = await run(
        ['init', join(workspace, dir), '--template', template, '--yes'],
        workspace
      )

      expect(code).toBe(0)

      const page = await read(dir)

      if (expected) expect(page).toMatch(expected)
      else expect(page).not.toMatch(/^page:/m)
    }
  })
  it('renders the chosen template into the generated config', async () => {
    const config = await fs.readFile(
      join(target(), 'vitrify.config.ts'),
      'utf8'
    )

    expect(config).toContain("template: 'landing'")
  })

  it('keeps the templates package in the UnoCSS content scan', async () => {
    const config = await fs.readFile(
      join(target(), 'vitrify.config.ts'),
      'utf8'
    )

    // Quasar component classes (`q-separator`, `q-card__actions--*`) and icon
    // classes (`i-mdi-phone`) are emitted *only* because the templates package
    // is scanned; the shortcut names are safelisted separately. Dropping this
    // include looks like a free ~17 KB of CSS and is actually an unstyled drawer
    // and missing icons, so it is pinned here.
    // Matched structurally rather than by the literal text: the pattern is
    // written with escaped backslashes, and a `toContain` of that text breaks on
    // how many of them survive the template engine and the test literal.
    expect(config).toMatch(
      /content:\s*\{[\s\S]*?pipeline:[\s\S]*?new RegExp\([\s\S]*?ssg\.templatePackage/
    )
    expect(config).toContain('include')
  })

  it('does not import a CSS file from the templates package', async () => {
    const config = await fs.readFile(
      join(target(), 'vitrify.config.ts'),
      'utf8'
    )

    // `globalCss` pulled in the templates package's own build output, which was
    // the UnoCSS scanner's leavings — `.outline`, `.grid`, `.h1` — and nothing
    // else. The package no longer builds CSS at all.
    expect(config).not.toContain('globalCss')
  })

  it('writes the site identity into the generated config', async () => {
    const config = await fs.readFile(
      join(target(), 'vitrify.config.ts'),
      'utf8'
    )

    expect(config).toContain('Acme')
  })

  it('rejects an unknown template with a non-zero exit', async () => {
    const { code, stderr } = await run(
      ['init', join(workspace, 'nope'), '--template', 'banana', '--yes'],
      workspace
    )

    expect(code).not.toBe(0)
    expect(stderr).toMatch(/Unknown template|banana/)
  })
})

describe('ssg check', () => {
  it('passes on a freshly generated project', async () => {
    const { code, stdout } = await run(['check'], join(workspace, 'site'))

    // A new project must satisfy its own contract, otherwise the first command
    // an agent runs after `init` fails.
    expect(code).toBe(0)
    expect(stdout).toContain('OK')
  })

  it('fails on a page with no description', async () => {
    const dir = await mkdtemp(join(workspace, 'check-'))
    await fs.mkdir(join(dir, 'src/pages'), { recursive: true })
    await fs.writeFile(
      join(dir, 'src/pages/Broken.md'),
      ['---', 'id: broken', 'title: Broken', '---', '', '# Broken', ''].join(
        '\n'
      )
    )

    const { code, stderr } = await run(['check'], dir)

    expect(code).toBe(1)
    expect(stderr).toContain('description')
  })

  it('fails on two pages claiming the same id', async () => {
    const dir = await mkdtemp(join(workspace, 'dupe-'))
    await fs.mkdir(join(dir, 'src/pages'), { recursive: true })

    for (const name of ['One', 'Two']) {
      await fs.writeFile(
        join(dir, `src/pages/${name}.md`),
        `---\nid: same\ntitle: ${name}\ndescription: A page.\n---\n\n## Body\n`
      )
    }

    const { code, stderr } = await run(['check'], dir)

    expect(code).toBe(1)
    expect(stderr).toContain('duplicate id')
  })

  it('fails on a subpages entry that resolves to nothing', async () => {
    const dir = await mkdtemp(join(workspace, 'subpage-'))
    await fs.mkdir(join(dir, 'src/pages'), { recursive: true })
    await fs.writeFile(
      join(dir, 'src/pages/Services.md'),
      '---\nid: services\ntitle: Services\ndescription: Services.\nsubpages:\n  - ghost\n---\n\n## Body\n'
    )

    const { code, stderr } = await run(['check'], dir)

    expect(code).toBe(1)
    expect(stderr).toContain('ghost')
  })

  it('treats an unknown tag as an error', async () => {
    const dir = await mkdtemp(join(workspace, 'tag-'))
    await fs.mkdir(join(dir, 'src/pages'), { recursive: true })
    await fs.writeFile(
      join(dir, 'src/pages/Home.md'),
      '---\nid: home\ntitle: Home\ndescription: Home.\ntags:\n  - menue\n---\n\n## Body\n'
    )

    const { code } = await run(['check'], dir)

    expect(code).toBe(1)
  })

  it('succeeds on an empty pages directory rather than failing a new project', async () => {
    const dir = await mkdtemp(join(workspace, 'empty-'))
    await fs.mkdir(join(dir, 'src/pages'), { recursive: true })

    const { code } = await run(['check'], dir)

    expect(code).toBe(0)
  })
})

describe('ssg add-page', () => {
  it('creates a page that passes check', async () => {
    const { code, stdout } = await run(
      ['add-page', 'about', '--title', 'About us', '--tags', 'menu'],
      join(workspace, 'site')
    )

    expect(code).toBe(0)
    expect(stdout).toContain('Created')

    const source = await fs.readFile(
      join(workspace, 'site/src/pages/about.md'),
      'utf8'
    )

    expect(source).toContain('id: about')
    expect(source).toContain('title: About us')
    expect(source).toContain('description:')
    expect(source).toContain('menu')

    // The generated page must satisfy the contract it will be checked against.
    const checked = await run(['check'], join(workspace, 'site'))
    expect(checked.code).toBe(0)
  })

  it('refuses to overwrite an existing page', async () => {
    const { code, stderr } = await run(
      ['add-page', 'about'],
      join(workspace, 'site')
    )

    expect(code).toBe(1)
    expect(stderr).toContain('Refusing to overwrite')
  })
})

describe('ssg verify', () => {
  async function withDist(
    html: string,
    assets: Record<string, string> = { 'main.mjs': 'export const a = 1\n' }
  ): Promise<string> {
    const dir = await mkdtemp(join(workspace, 'verify-'))
    await fs.mkdir(join(dir, 'dist/static'), { recursive: true })
    await fs.writeFile(join(dir, 'dist/static/index.html'), html)

    // A real build always ships some JavaScript. The byte budgets are measured
    // from the build output, and `verify` refuses to treat a zero-byte
    // measurement as a pass — so a fixture with no assets at all would (rightly)
    // fail the budget gate.
    for (const [name, contents] of Object.entries(assets)) {
      await fs.writeFile(join(dir, `dist/static/${name}`), contents)
    }

    return dir
  }

  const goodHtml = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<title>Acme</title>',
    '<meta name="description" content="A site.">',
    '<link rel="canonical" href="https://acme.test/">',
    '<script type="application/ld+json">{"@context":"https://schema.org"}</script>',
    '</head>',
    '<body><h1>Acme</h1></body>',
    '</html>'
  ].join('\n')

  it('passes a correct build (Lighthouse skipped)', async () => {
    const dir = await withDist(goodHtml)
    const { code, stdout } = await run(['verify', '--no-lighthouse'], dir)

    expect(code).toBe(0)
    expect(stdout).toContain('OK')
  })

  it('fails a build with a broken SEO surface, listing every fault', async () => {
    const broken = [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '<title>One</title>',
      '<title>Two</title>',
      '<link rel="canonical" href="/relative">',
      '<script type="application/ld+json">{ not json }</script>',
      '</head>',
      '<body><h1>One</h1><h1>Two</h1></body>',
      '</html>'
    ].join('\n')

    const dir = await withDist(broken)
    const { code, stderr } = await run(['verify', '--no-lighthouse'], dir)

    expect(code).toBe(1)
    expect(stderr).toContain('<title>')
    expect(stderr).toContain('description')
    expect(stderr).toContain('canonical')
    expect(stderr).toContain('JSON')
    expect(stderr).toContain('<h1>')
    expect(stderr).toContain('lang')
  })

  it('fails when there is no build output to verify', async () => {
    const dir = await mkdtemp(join(workspace, 'nobuild-'))
    const { code, stderr } = await run(['verify', '--no-lighthouse'], dir)

    expect(code).toBe(1)
    expect(stderr).toMatch(/No build output/)
  })

  it('writes a machine-readable report beside the build', async () => {
    const dir = await withDist(goodHtml)
    await run(['verify', '--no-lighthouse'], dir)

    const report = JSON.parse(
      await fs.readFile(join(dir, 'dist/static/verify-report.json'), 'utf8')
    )

    expect(report.ok).toBe(true)
    expect(report.pages).toBe(1)
    expect(report.budgets.js).toBeGreaterThan(0)
  })

  it('fails when the build ships no measurable assets at all', async () => {
    // A budget gate that reads zero and reports OK is worse than no gate: it
    // would pass a site whose assets were never measured. Pinned here so the
    // guard cannot be removed without a test going red.
    const dir = await withDist(goodHtml, {})
    const { code, stderr } = await run(['verify', '--no-lighthouse'], dir)

    expect(code).toBe(1)
    expect(stderr).toMatch(/cannot be trusted/)
  })
})

describe('ssg with an unknown command', () => {
  it('exits non-zero and shows usage', async () => {
    const { code, stderr } = await run(['frobnicate'], workspace)

    expect(code).toBe(1)
    expect(stderr).toContain('Unknown command')
  })
})
