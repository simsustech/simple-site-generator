// The CLI is exercised as a **subprocess** (seam S1), so this spec runs in the
// node environment: the command writes files and renders through sharp.
// @vitest-environment node

import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * `ssg generate-icons` — the favicon set and the header mark from one SVG.
 *
 * The contract that matters is the *shape of the output*, because that is what
 * a site's `vitrify.config.ts` and its `<link rel="icon">` point at: PNGs under
 * `public/`, one `favicon.ico`, and the source SVG copied beside them. The
 * pixel content belongs to icon-gen; what this spec pins is that the command
 * reads one file, writes those names, and refuses to invent an icon when there
 * is no source.
 */

const cli = resolve(
  fileURLToPath(
    new URL('../../packages/simple-site-generator/dist/cli.js', import.meta.url)
  )
)

/** A minimal but real SVG: the renderer rejects anything it cannot parse. */
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#2a428b"/>
  <circle cx="50" cy="50" r="18" fill="#ffffff"/>
</svg>
`

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
  workspace = await mkdtemp(join(tmpdir(), 'ssg-icons-'))
})

afterAll(async () => {
  await rm(workspace, { recursive: true, force: true })
})

const siteDir = () => join(workspace, 'site')

describe('ssg generate-icons', () => {
  it('writes the favicon set and the header SVG from logo.svg', async () => {
    const dir = siteDir()

    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(join(dir, 'logo.svg'), LOGO_SVG)

    const { code, stdout } = await run(['generate-icons'], dir)

    expect(code).toBe(0)

    const publicFiles = await fs.readdir(join(dir, 'public')).catch(() => [])

    // A tab bar asks for the small ones, a bookmark list and a pinned tile for
    // the large ones, and a legacy Windows shell for the ICO.
    for (const size of [32, 48, 96, 128, 256]) {
      expect(publicFiles).toContain(`favicon-${size}.png`)
    }

    expect(publicFiles).toContain('favicon.ico')
    // The header draws the source itself: same artwork, no second copy to keep
    // in step, and it stays sharp on a 3x display.
    expect(publicFiles).toContain('logo.svg')
    expect(stdout).toContain('favicon-96.png')
  }, 30_000)

  it('says what is missing when there is no source SVG', async () => {
    const dir = join(workspace, 'empty')

    await fs.mkdir(dir, { recursive: true })

    const { code, stderr } = await run(['generate-icons'], dir)

    expect(code).toBe(1)
    // The message has to name the file and the flag: "no icons" without a path
    // is a search, and this should be one line.
    expect(stderr).toContain('logo.svg')
    expect(stderr).toContain('--input')
  }, 15_000)
})

describe('the scaffold', () => {
  it('gives a new site the script that regenerates its icons', async () => {
    const dir = join(workspace, 'scaffolded')

    await fs.mkdir(dir, { recursive: true })

    const { code } = await run(
      [
        'init',
        '.',
        '--yes',
        '--site-name',
        'Icons',
        '--url',
        'https://icons.test'
      ],
      dir
    )

    expect(code).toBe(0)

    const manifest = JSON.parse(
      await fs.readFile(join(dir, 'package.json'), 'utf8')
    ) as { scripts: Record<string, string> }

    // The script, not a copy of the rendering: one command generates the set
    // wherever the artwork lives, so a re-traced logo cannot leave the 96px PNG
    // on the old picture.
    expect(manifest.scripts['generate:icons']).toBe('ssg generate-icons')
  }, 60_000)
})
