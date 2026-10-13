import { describe, expect, it } from 'vitest'
import { ssgShortcuts, ssgSafelist } from '../src/design/design.js'

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
})
