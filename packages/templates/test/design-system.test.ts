import { describe, expect, it } from 'vitest'
import { ssgShortcuts, ssgSafelist } from '../src/design.js'

/**
 * Integrity of the shortcut table.
 *
 * Written after the same mistake was made twice while editing it. A shortcut
 * array that loses its separating comma does not fail the build and does not
 * look wrong in a diff:
 *
 * ```ts
 *   [
 *     'ssg-principles__note',
 *     `...`
 *   ][                       // <-- the next entry's opening bracket
 *     ('ssg-proof-section__heading', '...')
 *   ],
 * ```
 *
 * That parses as a *computed member access* — `array[('a', 'b')]` — which
 * evaluates to `undefined`. So the entry before it survives, the entry after it
 * silently disappears, and `tsc`, oxlint and the whole test suite stay green
 * while the class it named renders unstyled. It was caught both times only by a
 * runtime check on the resolved config.
 *
 * The shape assertions below turn that into one clear failure naming the entry.
 */

type Shortcut = (typeof ssgShortcuts)[number]

describe('design system shortcut table', () => {
  it('has no undefined or malformed entries', () => {
    const bad = ssgShortcuts
      .map((shortcut, index) => ({ shortcut, index }))
      .filter(({ shortcut }) => {
        const entry = shortcut as Shortcut
        return (
          !Array.isArray(entry) ||
          typeof entry[0] !== 'string' ||
          entry[0].length === 0 ||
          // A string body, or a function body for a dynamic shortcut. Anything
          // else — most importantly `undefined` — is a malformed entry.
          !['string', 'function'].includes(typeof entry[1])
        )
      })

    expect(
      bad.map(({ shortcut, index }) => `${index}: ${JSON.stringify(shortcut)}`)
    ).toEqual([])
  })

  it('names every shortcut with the ssg- prefix', () => {
    // The prefix is what the safelist, the preflights and the markup all agree
    // on; a class outside it would not be found by any of them.
    const withoutPrefix = ssgShortcuts
      .filter((shortcut) => Array.isArray(shortcut))
      .map((shortcut) => shortcut[0])
      .filter((name) => typeof name === 'string' && !name.startsWith('ssg-'))

    expect(withoutPrefix).toEqual([])
  })

  it('has no duplicate names, which would silently shadow each other', () => {
    const names = ssgShortcuts
      .filter((shortcut) => Array.isArray(shortcut))
      .map((shortcut) => shortcut[0])

    const duplicates = names.filter(
      (name, index) => names.indexOf(name) !== index
    )

    expect(duplicates).toEqual([])
  })

  it('safelists every shortcut name', () => {
    // The safelist is what makes the shortcuts survive Vite's chunk splitting,
    // so a shortcut missing from it is a shortcut that sometimes does not emit.
    const names = ssgShortcuts
      .filter((shortcut) => Array.isArray(shortcut))
      .map((shortcut) => shortcut[0])
      .filter((name): name is string => typeof name === 'string')

    const missing = names.filter((name) => !ssgSafelist.includes(name))

    expect(missing).toEqual([])
  })

  it('does not set display on a base class that a variant also sets it on', () => {
    // `ssg-demo` is always rendered together with a variant that decides where it
    // sits and whether it shows at all. Two single-class selectors that both set
    // `display` resolve by stylesheet order, not by intent — which is how the
    // hero graphic ended up drawn over the headline on mobile, where
    // `ssg-business__band-demo` asks for `hidden`.
    const bodyOf = (name: string) => {
      const entry = ssgShortcuts.find(
        (shortcut) => Array.isArray(shortcut) && shortcut[0] === name
      )
      return typeof entry?.[1] === 'string' ? entry[1] : ''
    }

    expect(bodyOf('ssg-demo')).not.toMatch(
      /(^|\s)(block|hidden|inline|inline-block|flex|grid|inline-flex)(\s|$)/
    )

    // The variant is the one place that decides, and it must hide below `lg`.
    expect(bodyOf('ssg-business__band-demo')).toMatch(/(^|\s)hidden(\s|$)/)
    expect(bodyOf('ssg-business__band-demo')).toMatch(/(^|\s)lg:block(\s|$)/)
  })

  it('leaves the business header band to its variant, and lets the band size itself', () => {
    // The same defect as above, one level up: `ssg-business__header` and
    // `ssg-business__header--decorated` are rendered together on every page that
    // declares a `demo` or a `headerImage`. They used to be two complete page
    // headers, so on the reference site the base's `flex`/`flex-wrap` and the
    // variant's `display`/`margin-bottom` resolved to a combination nobody
    // designed (measured: `flex-wrap: wrap` inside the band, with the base's
    // 68px margin losing to the variant's). The base must stay layout-neutral
    // and the variant owns the row.
    const bodyOf = (name: string) => {
      const entry = ssgShortcuts.find(
        (shortcut) => Array.isArray(shortcut) && shortcut[0] === name
      )
      return typeof entry?.[1] === 'string' ? entry[1] : ''
    }

    expect(bodyOf('ssg-business__header')).not.toMatch(
      /(^|\s)(block|hidden|inline|inline-block|flex|grid|inline-flex)(\s|$)/
    )
    expect(bodyOf('ssg-business__header--decorated')).toMatch(
      /(^|\s)lg:flex(\s|$)/
    )

    // And the demo is a flex child of that row, not an absolute overlay: an
    // overlay keeps its own width and therefore a height the band cannot grow
    // to, which is how 100px of a 215px graphic ended up behind `overflow:
    // hidden`.
    expect(bodyOf('ssg-business__band-demo')).not.toMatch(
      /(^|\s)absolute(\s|$)/
    )
  })

  it('styles every ssg-* class its own components render', () => {
    // A shortcut is only half the contract: the class also has to exist in the
    // table. `ssg-header__language` was written in `SiteHeader.vue` and nowhere
    // else, so the language switch rendered as a bare `<a>` — the browser's own
    // link colour, underlined — and `ssg verify` accepted it because the class
    // was listed in `UNSTYLED_HOOKS`, where "carries no styling by design" was
    // the wrong call for a control.
    const names = new Set(
      ssgShortcuts
        .filter((shortcut) => Array.isArray(shortcut))
        .map((shortcut) => shortcut[0])
    )

    expect(names.has('ssg-header__language')).toBe(true)
  })
})
