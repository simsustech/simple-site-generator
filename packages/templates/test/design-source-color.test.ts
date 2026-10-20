import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { ssgSourceColor, ssgUnoConfig } from '../src/design.js'

/**
 * Colour has exactly one input.
 *
 * The design system reads the MD3 role tokens `unocss-preset-quasar` publishes,
 * and those derive from a single source colour. Before this, an app also had to
 * supply a nine-entry `colors` map that nothing in the templates read: it was
 * spread into the UnoCSS `theme` by the scaffold's config, so it looked
 * load-bearing, and a site that omitted it silently lost `bg-primary`-style
 * utilities while the templates kept working. Two sources for one palette is how
 * a header ends up green on a blue site.
 *
 * The assertions below are what keeps the second source gone: the theme carries
 * no palette of its own, and the one colour constant the package exports is a
 * real hex — read by the scaffold, so it has to be a colour, not a token name.
 */
describe('design system colour input', () => {
  it('does not carry a colours palette in the UnoCSS theme', () => {
    // A `colors` key here is what the app's map used to be spread into. The
    // theme keeps the spacing and type scale only; colour comes from the role
    // tokens, which follow `sourceColor`.
    expect(Object.keys(ssgUnoConfig.theme ?? {})).not.toContain('colors')
  })

  it('exports the source colour as a valid hex', () => {
    expect(ssgSourceColor).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('exports the same colour the scaffold starts a new site from', () => {
    // The export is only meaningful if it is the default a scaffolded site
    // begins with. When the two drift, a new site starts on one colour and the
    // package documents another, and nobody notices because both are "green".
    // Built from `import.meta.url` via `dirname`/`resolve` rather than
    // `new URL('…', import.meta.url)`: Vite rewrites that form for asset
    // resolution and hands back a URL that is not a `file:` URL, which
    // `fileURLToPath` rejects.
    const scaffoldConfig = readFileSync(
      resolve(
        dirname(fileURLToPath(import.meta.url)),
        '../../simple-site-generator/templates/app/vitrify.config.ts.hbs'
      ),
      'utf8'
    )

    const sourceColor = /sourceColor:\s*'(#[0-9a-f]{6})'/i.exec(scaffoldConfig)

    expect(sourceColor?.[1]?.toLowerCase()).toBe(ssgSourceColor.toLowerCase())
  })
})
