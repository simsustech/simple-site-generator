import { promises as fs } from 'node:fs'
import { createRequire } from 'node:module'
import { basename, isAbsolute, join, resolve } from 'node:path'
import { appDir, publicDir } from '../paths.js'

/**
 * `ssg generate-icons` — favicons, and the header mark, from one source SVG.
 *
 * The site ships three different pictures of the same mark and they used to be
 * produced by hand: a favicon set for a tab bar, a `favicon.ico` for the
 * browsers that still ask for one, and the SVG the header draws. Hand-made
 * icons drift — a logo is traced again and the 96px PNG is left on the old
 * artwork, which is invisible on the site and obvious in a bookmark bar.
 *
 * So one command reads the source SVG and writes all of them. Two points that
 * decide the output:
 *
 * 1. **A favicon is a PNG/ICO, never the SVG itself.** `rel="icon"` pointing at
 *    an SVG is ignored by every browser that is not one of the two newest, and
 *    the tab then shows a blank page icon. The SVG is copied for the *header*,
 *    where it is drawn at 40px on the site's own surface and wants to stay sharp
 *    on a 3× display.
 * 2. **The rasterising belongs to icon-gen**, not to this command: it renders
 *    with sharp's librsvg, which is what makes a gradient and a clip-path in the
 *    artwork survive at 16px. Reimplementing that here would be a second
 *    renderer to disagree with the first.
 */

/** One size in the generated ICO, and one PNG file. */
export interface IconSizes {
  pngSizes: number[]
  icoSizes: number[]
}

export interface GenerateIconsOptions {
  app?: string
  /** Source SVG. Defaults to `<app>/logo.svg`. */
  input?: string
  /** Output directory. Defaults to `<app>/public`. */
  output?: string
  /** PNG file prefix, e.g. `favicon-`. */
  name?: string
  sizes?: IconSizes
}

export interface GenerateIconsResult {
  /** Every file written, absolute. */
  files: string[]
  /** The SVG copied for the header, when one was copied. */
  logo?: string
}

/**
 * The sizes a site actually needs.
 *
 * 48 and 96 are what a browser tab and a bookmark list ask for; 128 is a
 * Windows shortcut and a macOS bookmark tile; 256 survives a pinned tile on a
 * high-density display. The ICO carries the three a legacy Windows shell reads.
 */
const DEFAULT_SIZES: IconSizes = {
  pngSizes: [32, 48, 96, 128, 256],
  icoSizes: [16, 24, 32, 48, 64]
}

type IconGen = (
  src: string,
  dest: string,
  options: {
    favicon?: { name?: string; pngSizes?: number[]; icoSizes?: number[] }
    report: boolean
  }
) => Promise<string[]>

/**
 * Load icon-gen from the project being built, and only then from this package.
 *
 * The project's own copy wins so a site can pin a different icon-gen than the
 * kit ships, and this package's copy is the fallback so a site that never
 * declared one still works. icon-gen is CommonJS with a `default` export, so
 * both shapes are unwrapped rather than trusted.
 */
function loadIconGen(app: string): IconGen {
  const loaders = [
    createRequire(join(app, 'package.json')),
    createRequire(import.meta.url)
  ]

  for (const load of loaders) {
    try {
      const loaded = load('icon-gen') as IconGen | { default: IconGen }
      const fn =
        (loaded as { default?: IconGen }).default ?? (loaded as IconGen)

      if (typeof fn === 'function') return fn
    } catch {
      // The next loader, and then the message below.
    }
  }

  throw new Error(
    'generate-icons needs the `icon-gen` package to rasterise the SVG, and ' +
      'neither this project nor the kit provides it. Install it with:\n' +
      '  pnpm add -D icon-gen'
  )
}

/** Every file in a directory, recursive, so the report names what was written. */
async function filesIn(dir: string): Promise<string[]> {
  const found: string[] = []

  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)

    if (entry.isDirectory()) found.push(...(await filesIn(full)))
    else found.push(full)
  }

  return found
}

/**
 * `ssg generate-icons` — write the favicon set and copy the header mark.
 *
 * Idempotent: running it twice writes the same files, because the source SVG is
 * the only input. It never touches anything in the output directory except the
 * files it names, so a site can keep its own photographs and PDFs beside them.
 */
export async function generateIcons(
  options: GenerateIconsOptions = {}
): Promise<GenerateIconsResult> {
  const app = options.app ?? appDir()
  const input = options.input
    ? resolve(app, options.input)
    : join(app, 'logo.svg')
  const output = options.output
    ? isAbsolute(options.output)
      ? options.output
      : resolve(app, options.output)
    : publicDir(app)
  const name = options.name ?? 'favicon-'
  const sizes = options.sizes ?? DEFAULT_SIZES

  try {
    await fs.access(input)
  } catch {
    throw new Error(
      `No source SVG at ${input}. Put the mark there, or pass --input <file>.\n` +
        '  The icon set is rendered from it, so there is nothing to generate ' +
        'without one.'
    )
  }

  await fs.mkdir(output, { recursive: true })

  const generate = loadIconGen(app)

  const written = await generate(input, output, {
    favicon: {
      name,
      pngSizes: sizes.pngSizes,
      icoSizes: sizes.icoSizes
    },
    report: false
  })

  // The header draws the source itself. Same artwork, no second copy to keep in
  // step, and an SVG stays sharp at every density.
  const logo = join(output, basename(input))

  await fs.copyFile(input, logo)

  return {
    files: written.length > 0 ? written : await filesIn(output),
    logo
  }
}
