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
