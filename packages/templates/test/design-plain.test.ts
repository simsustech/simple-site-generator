import { describe, expect, it } from 'vitest'
import { ssgShortcuts } from '../src/design.js'

/**
 * The `plain` template's styling, held to the same rules as the rest.
 *
 * `plain` is the sober template for a local business with one service and one
 * action: a price, an action, then the rest. Its styling came from a hand-written
 * mockup stylesheet, which is not where styling lives here — a `.vue` file in this
 * package has no `<style>` block, and `ssg verify` refuses an `ssg-*` class that
 * the built CSS does not define.
 *
 * Two properties are what this file exists for, and neither is visible in a diff:
 *
 *   1. **Colour has one source.** The mockup painted with its own hexes. A
 *      shortcut that carries a hex looks right in one theme and is invisible in
 *      the other, because the MD3 role tokens flip with `body--dark` and a
 *      literal does not.
 *   2. **The type scale is not re-typed.** The mockup restated its sizes at every
 *      component. The shared `STEP` scale is the scale; a shortcut that retypes a
 *      `clamp()` per component is how two headings end up 4% apart for no reason.
 */

/** Body of a shortcut by name, or `undefined` when the name is not in the table. */
function shortcutBody(name: string): string | undefined {
  const entry = ssgShortcuts.find(
    (shortcut) => Array.isArray(shortcut) && shortcut[0] === name
  )
  return typeof entry?.[1] === 'string' ? entry[1] : undefined
}

const plainNames = () =>
  ssgShortcuts
    .filter((shortcut): shortcut is [string, string] => Array.isArray(shortcut))
    .map(([name]) => name)
    .filter((name) => name.startsWith('ssg-plain__'))

/**
 * Every class the template's markup renders, on one line per component.
 *
 * Kept as a literal list rather than derived from the markup so that a shortcut
 * dropped from `design.ts` fails here even before the component that uses it is
 * read — and so the list is reviewable as a design decision.
 */
const REQUIRED = [
  // Page furniture
  'ssg-plain__offer',
  'ssg-plain__intro',
  'ssg-plain__region',
  'ssg-plain__title',
  'ssg-plain__lede',
  'ssg-plain__section-head',
  'ssg-plain__section-title',
  'ssg-plain__section-lede',
  // The price card
  'ssg-plain__price',
  'ssg-plain__price-label',
  'ssg-plain__price-value',
  'ssg-plain__price-unit',
  'ssg-plain__price-note',
  // The action
  'ssg-plain__actions',
  // A two-column summary row
  'ssg-plain__sum-row',
  // The four steps
  'ssg-plain__steps',
  'ssg-plain__steps-list',
  'ssg-plain__steps-grid',
  'ssg-plain__step',
  'ssg-plain__step-number',
  'ssg-plain__step-title',
  'ssg-plain__step-text',
  // The form
  'ssg-plain__field',
  'ssg-plain__label',
  'ssg-plain__hint',
  'ssg-plain__input',
  'ssg-plain__check',
  'ssg-plain__status',
  'ssg-plain__status--ok',
  'ssg-plain__status--error',
  // The calculator
  'ssg-plain__calc',
  'ssg-plain__calc-in',
  'ssg-plain__calc-out',
  'ssg-plain__range',
  // The tariff table
  'ssg-plain__table',
  'ssg-plain__table-caption',
  'ssg-plain__table-head',
  'ssg-plain__table-cell',
  // A value that is not known yet, and numerals that line up
  'ssg-plain__tbd',
  'ssg-plain__tnum'
]

describe('plain template shortcuts', () => {
  it('defines every class the plain template renders', () => {
    const missing = REQUIRED.filter((name) => shortcutBody(name) === undefined)

    expect(missing).toEqual([])
  })

  it('carries no hard-coded colour, so both themes follow the role tokens', () => {
    // `#hex`, `rgb()`, `hsl()` and named colours are all out; `var(--q-*)` is the
    // only way a colour is named. A literal here renders in exactly one theme.
    const offenders = plainNames().filter((name) => {
      const body = shortcutBody(name) ?? ''
      return (
        /#[0-9a-f]{3,8}\b/i.test(body) ||
        /\b(rgb|hsl|oklch|lab)\(/i.test(body) ||
        /\b(white|black|red|green|blue|grey|gray|silver|maroon|navy)\b/i.test(
          body
        )
      )
    })

    expect(offenders).toEqual([])
  })

  it('takes its type scale from the shared one instead of retyping it', () => {
    // The page title is `STEP['3']` — the scale's own top step, which is the
    // 2.75rem the mockup measured. Writing the clamp out here instead would be a
    // fourth copy of a number that already exists.
    expect(shortcutBody('ssg-plain__title')).toMatch(/(^|\s)text-step-3(\s|$)/)

    // Exactly one literal size remains: the section heading, at 1.72rem, which
    // sits between two steps of the shared scale. One exception that is written
    // once is a decision; the same clamp in five shortcuts is a second scale.
    const literals = plainNames().filter((name) =>
      /\[(font-size:)?clamp\(/.test(shortcutBody(name) ?? '')
    )

    expect(literals).toEqual(['ssg-plain__section-title'])
  })

  it('keeps the body measure on the section head, not on every block', () => {
    // Same lesson as `ssg-prose`: capping the container shrinks every figure in
    // it. Only the heading block is capped at the measure.
    expect(shortcutBody('ssg-plain__section-head')).toMatch(
      /66ch|max-w-measure/
    )
    expect(shortcutBody('ssg-plain__title')).not.toMatch(/66ch|max-w-measure/)
  })
})
