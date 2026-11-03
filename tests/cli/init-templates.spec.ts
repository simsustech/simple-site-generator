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
 * Seam S1 — what `ssg init` writes into a new project's config.
 *
 * The generated `vitrify.config.ts` is the contract between the scaffold and the
 * design system, and it is only observable at the CLI boundary: the template is
 * a `.hbs` file rendered onto disk, so a unit test of the config object would
 * prove nothing about what a new site actually receives.
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
  workspace = await mkdtemp(join(tmpdir(), 'ssg-init-templates-'))
})

afterAll(async () => {
  await rm(workspace, { recursive: true, force: true })
})

const readConfig = (dir: string) =>
  fs.readFile(join(workspace, dir, 'vitrify.config.ts'), 'utf8')

/**
 * A Caddyfile with its comments removed, so an assertion counts directives rather
 * than prose. The comments in these files name the directives they explain.
 */
function directives(config: string): string {
  return config
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('#'))
    .join('\n')
}

describe('the generated config colour input', () => {
  it('sets a single source colour and no palette map', async () => {
    // A new site used to receive two colour inputs: a nine-entry `colors` map
    // and a `sourceColor`. Only the second was read — the map was spread into
    // the UnoCSS theme beside the MD3 role tokens, so it produced utilities that
    // disagreed with every template class the moment either moved. One input is
    // the rule now, and the scaffold is where a site learns it.
    const { code } = await run(
      ['init', join(workspace, 'colour'), '--template', 'business', '--yes'],
      workspace
    )

    expect(code).toBe(0)

    const config = await readConfig('colour')

    expect(config).toMatch(/sourceColor:\s*'#[0-9a-f]{6}'/i)
    // No palette map: neither the interface member, the object literal, nor the
    // spread into the UnoCSS theme.
    expect(config).not.toMatch(/^\s*colors:/m)
    expect(config).not.toContain('ssg.colors')
  })

  it('leaves the theme as the design system published it', async () => {
    // `theme: { ...ssgUnoConfig.theme, colors: ssg.colors }` is the exact line
    // that merged the second palette in. The theme is now spread whole.
    const config = await readConfig('colour')

    expect(config).toMatch(/theme:\s*ssgUnoConfig\.theme/)
    expect(config).not.toMatch(/colors:\s*ssg\./)
  })
})

describe('ssg init --template plain', () => {
  it('scaffolds a plain site and names the module in the generated config', async () => {
    // The template name reaches three places at once: the config's `template`
    // field (which the app resolves through `virtual:ssg:template`), the page
    // component the router picks, and the CSS class coverage check. A name that
    // is accepted but not written leaves a site that cannot build.
    const { code, stdout } = await run(
      [
        'init',
        join(workspace, 'plain'),
        '--template',
        'plain',
        '--site-name',
        'Plain Co',
        '--yes'
      ],
      workspace
    )

    expect(code).toBe(0)
    expect(stdout).toContain('plain')

    const config = await readConfig('plain')

    expect(config).toContain("template: 'plain'")
    // `plain` exports `Page` only, so a scaffolded home page must not name a
    // component the module does not have.
    const home = await fs.readFile(
      join(workspace, 'plain', 'src/pages/Index.md'),
      'utf8'
    )

    expect(home).not.toMatch(/^page:/m)
  })

  it('names all four templates when the name is unknown', async () => {
    // `TEMPLATES` is the single list the type is derived from and the message is
    // printed from, so an unknown name must list exactly what is accepted — a
    // message that omits a valid template sends the reader to the source.
    const { code, stderr } = await run(
      ['init', join(workspace, 'nope'), '--template', 'nope', '--yes'],
      workspace
    )

    expect(code).not.toBe(0)

    for (const template of ['docs', 'landing', 'business', 'plain']) {
      expect(stderr).toContain(template)
    }
  })
})

describe('the generated package.json', () => {
  it('provides the ssg binary its own scripts call', async () => {
    // A generated project's `check`, `build` and `verify` scripts run `ssg`, and
    // nothing in the dependency list provided it: a fresh site installed and
    // then failed with "ssg: not found". The reference site adds it by hand,
    // which is exactly the fix a scaffold should not require.
    const { code } = await run(
      ['init', join(workspace, 'binary'), '--template', 'business', '--yes'],
      workspace
    )

    expect(code).toBe(0)

    const pkg = JSON.parse(
      await fs.readFile(join(workspace, 'binary', 'package.json'), 'utf8')
    ) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }

    expect(pkg.devDependencies?.['simple-site-generator']).toMatch(/^\^0\./)
    expect(pkg.dependencies?.['@simple-site-generator/templates']).toMatch(
      /^\^0\./
    )
  })

  it('scaffolds pins that follow the release, both kit packages on one version', async () => {
    // A caret on a `0.x` version locks the minor, so a scaffold pinned to an old
    // release installs that release — retired template names, no fixes — however
    // long ago it shipped.
    //
    // What is asserted here is not a hand-typed constant. The pins are derived
    // from the CLI's own manifest (`KIT_PIN` in `init.ts`), because the two kit
    // packages are one `fixed` group: `changeset version` gives them one version
    // and the scaffold follows. The earlier form of this test compared a typed
    // `^0.4.0` against the manifest, which made it red from the release of 0.4.1
    // until somebody remembered to edit the constant — a test that only passed
    // while nobody had released.
    const { code } = await run(
      ['init', join(workspace, 'pins'), '--template', 'plain', '--yes'],
      workspace
    )

    expect(code).toBe(0)

    const pkg = JSON.parse(
      await fs.readFile(join(workspace, 'pins', 'package.json'), 'utf8')
    ) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }

    const versionOf = async (path: string): Promise<string> => {
      const manifest = JSON.parse(await fs.readFile(path, 'utf8')) as {
        version: string
      }
      return manifest.version
    }

    const templates = await versionOf(
      fileURLToPath(
        new URL('../../packages/templates/package.json', import.meta.url)
      )
    )
    const cli = await versionOf(
      fileURLToPath(
        new URL(
          '../../packages/simple-site-generator/package.json',
          import.meta.url
        )
      )
    )
    // vitrify is not a dependency of this workspace root; the templates package
    // is the one that declares and installs it.
    const vitrify = await versionOf(
      fileURLToPath(
        new URL(
          '../../packages/templates/node_modules/vitrify/package.json',
          import.meta.url
        )
      )
    )

    // The invariant that makes one derived pin correct for two packages: a fixed
    // group is released on a single version.
    expect(templates).toBe(cli)
    expect(pkg.dependencies?.['@simple-site-generator/templates']).toBe(
      `^${templates}`
    )
    expect(pkg.devDependencies?.['simple-site-generator']).toBe(`^${cli}`)
    // Locked to the minor as well: 0.32.0 is the line that hashes the client
    // chunks, and the scaffolded `@hashed` cache rule is only worth anything
    // there.
    expect(pkg.devDependencies?.vitrify).toBe(`^${vitrify}`)
  })

  it('writes a site name with an ampersand as itself, not as an entity', async () => {
    // `renderDirectory` runs the scaffold through Handlebars, whose double-brace
    // form escapes HTML. In a JS string that is silently wrong: a name containing
    // `&` became its HTML entity, which renders as `&amp;amp;` in `<title>` and
    // puts an escaped name in the JSON-LD and the sitemap.
    const { code } = await run(
      [
        'init',
        join(workspace, 'ampersand'),
        '--template',
        'plain',
        '--site-name',
        'Ampersand & Fixture',
        '--yes'
      ],
      workspace
    )

    expect(code).toBe(0)

    const config = await readConfig('ampersand')

    expect(config).toContain(`title: "Ampersand & Fixture",`)
    // The comment above the value spells `&amp;` out as the failure mode, so the
    // assertion is on the value, not on the whole file.
    expect(config).not.toMatch(/title: "Ampersand &amp;/)
  })

  it('turns a display name into a package name vitrify accepts', async () => {
    // `--site-name` used to be written into `package.json` as `name`, and
    // vitrify refuses a `name` with spaces in it: "Invalid name: Example Co".
    // The scaffold could not build. The display name still reaches productName.
    const { code } = await run(
      [
        'init',
        join(workspace, 'display'),
        '--template',
        'landing',
        '--site-name',
        'My Long Site Name',
        '--yes'
      ],
      workspace
    )

    expect(code).toBe(0)

    const pkg = JSON.parse(
      await fs.readFile(join(workspace, 'display', 'package.json'), 'utf8')
    ) as { name: string; productName?: string }

    expect(pkg.name).toBe('my-long-site-name')
    expect(pkg.productName).toBe('My Long Site Name')
  })

  it('takes an explicit package name over the slug', async () => {
    const { code } = await run(
      [
        'init',
        join(workspace, 'explicit'),
        '--template',
        'business',
        '--site-name',
        'My Long Site Name',
        '--package-name',
        'explicit-name',
        '--yes'
      ],
      workspace
    )

    expect(code).toBe(0)

    const pkg = JSON.parse(
      await fs.readFile(join(workspace, 'explicit', 'package.json'), 'utf8')
    ) as { name: string }

    expect(pkg.name).toBe('explicit-name')
  })
})

describe('the generated home page', () => {
  it('names Landing for the modules that export one', async () => {
    // `business` grew a `Landing` component because a local business's front
    // page is not a service page. The scaffold writes `page: Landing` only where
    // that component exists — for a module without it, the router throws during
    // prerender and the site cannot build at all.
    for (const [template, expectsLanding] of [
      ['business', true],
      ['landing', true],
      ['docs', false],
      ['plain', false]
    ] as const) {
      const { code } = await run(
        [
          'init',
          join(workspace, `home-${template}`),
          '--template',
          template,
          '--yes'
        ],
        workspace
      )

      expect(code).toBe(0)

      const home = await fs.readFile(
        join(workspace, `home-${template}`, 'src/pages/Index.md'),
        'utf8'
      )

      expect(/^page: Landing$/m.test(home)).toBe(expectsLanding)
    }
  })
})

describe('the generated deploy target', () => {
  it('splits the origin into a host for Caddy and the /srv path', async () => {
    // The scaffold interpolated the full origin into both, which produced
    // `root * /srv/https://example.com` and a Caddy site address of
    // `https://example.com` — a directory no server has. The origin still
    // reaches `ssg.url`, because a canonical has to be absolute.
    const { code } = await run(
      [
        'init',
        join(workspace, 'host'),
        '--template',
        'business',
        '--url',
        'https://www.example.com/',
        '--yes'
      ],
      workspace
    )

    expect(code).toBe(0)

    const caddy = await fs.readFile(
      join(workspace, 'host', 'build/Caddyfile'),
      'utf8'
    )

    expect(caddy.startsWith('www.example.com {')).toBe(true)
    expect(caddy).toContain('root * /srv/www.example.com')
    expect(caddy).not.toContain('/srv/https:')

    // Both files end up inside the web root: `Caddyfile` because the server
    // imports it from there, `Caddyfile.preview` because the same build copies it
    // next to the site. So both have to keep it out of `file_server`, and the
    // slash-prefixed form is the one that validates and does nothing — `hide`
    // matches on file name. Asserted over directives, because the comment that
    // explains this names both forms.
    const preview = await fs.readFile(
      join(workspace, 'host', 'build/Caddyfile.preview'),
      'utf8'
    )

    for (const config of [caddy, preview]) {
      expect(directives(config).match(/hide Caddyfile/g)).toHaveLength(2)
      expect(directives(config)).not.toContain('hide /Caddyfile')
    }

    const workflow = await fs.readFile(
      join(workspace, 'host', '.github/workflows/deploy-rsync.yaml'),
      'utf8'
    )

    // The workflow keeps `${{env.host}}` in the path — the literal host there
    // would have to be kept in step by hand — but the env value is the bare host.
    expect(workflow).toContain('host: www.example.com')
    expect(workflow).toContain('remote_path: /srv/${{env.host}}')
    expect(workflow).not.toContain('/srv/https:')

    const config = await readConfig('host')

    expect(config).toContain('url: "https://www.example.com/"')
  })
})

describe('the generated router', () => {
  it('has an explicit 404 route beside the catch-all', async () => {
    // The scaffolded Caddyfile rewrites a missing URL to `/404.html`, and nothing
    // created that file: the prerenderer writes one HTML file per concrete route
    // path, and a catch-all pattern is not one. Every scaffolded site answered
    // 404 with an empty body — measured on two of them.
    const { code } = await run(
      ['init', join(workspace, 'route'), '--template', 'plain', '--yes'],
      workspace
    )

    expect(code).toBe(0)

    const routes = await fs.readFile(
      join(workspace, 'route', 'src/router/routes.ts'),
      'utf8'
    )

    expect(routes).toContain("path: '404',")
    // The shared metadata, so `404.html` carries the `description` that
    // `ssg verify` requires of every built HTML file.
    expect(routes).toContain('const notFoundMeta = {')
    expect(routes).toContain('description:')
    expect(routes.match(/component: notFoundPage/g)).toHaveLength(2)
  })

  it('ships the Caddyfile guard as a test, so `pnpm test` has one', async () => {
    // A fresh site's `pnpm test` ran `vitrify test` with no test files and exited
    // non-zero, which reads as a broken scaffold. The guard is also the thing
    // that keeps `hide Caddyfile` and the hash class from regressing silently.
    const { code } = await run(
      ['init', join(workspace, 'guard'), '--template', 'plain', '--yes'],
      workspace
    )

    expect(code).toBe(0)

    const guard = await fs.readFile(
      join(workspace, 'guard', 'test/caddyfile.test.ts'),
      'utf8'
    )

    expect(guard).toContain('hide Caddyfile')
    expect(guard).toContain('@hashed path_regexp hashed')
  })
})

describe('the generated preview', () => {
  it('prints the URL it binds, from one port the Caddyfile agrees on', async () => {
    // `caddy run` on a `:port` site block announces no URL — just a JSON line
    // with `"addr":":8150"` — so the address is knowledge the reader has to
    // carry. Worse, Caddy binds with `reuseport`: two previews on one port both
    // "succeed" and the kernel hands each request to whichever process it likes,
    // which surfaces as one site's HTML with another site's modules.
    //
    // Sites built from this kit hit both, so the scaffold now ships
    // `scripts/preview.mjs`, which prints the address before starting and passes
    // the same port in. A `preview` script that bypasses it brings both back, so
    // the pair is asserted here: the script is wired, and its default port is the
    // one the Caddyfile would bind on its own.
    const { code } = await run(
      ['init', join(workspace, 'preview'), '--template', 'plain', '--yes'],
      workspace
    )

    expect(code).toBe(0)

    const pkg = JSON.parse(
      await fs.readFile(join(workspace, 'preview', 'package.json'), 'utf8')
    ) as { scripts: Record<string, string> }

    expect(pkg.scripts.preview).toContain('node scripts/preview.mjs')

    const script = await fs.readFile(
      join(workspace, 'preview', 'scripts/preview.mjs'),
      'utf8'
    )

    expect(script).toContain('Preview: http://localhost:')

    const port = /const DEFAULT_PORT = '(\d+)'/.exec(script)?.[1]

    expect(port).toBeDefined()

    const preview = await fs.readFile(
      join(workspace, 'preview', 'build/Caddyfile.preview'),
      'utf8'
    )

    expect(preview).toContain(`:{$PREVIEW_PORT:${port}} {`)
  })
})
