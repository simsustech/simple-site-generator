import { describe, expect, it } from 'vitest'
import { ssgPreflights, ssgShortcuts } from '../src/design.js'

/**
 * The header is 50px, and everything below it agrees.
 *
 * Quasar reserves the header's height for the page container at SSR time with
 * no browser to measure with, so it writes a constant: 50px, the toolbar's own
 * minimum. The navigation is built from `q-item`, and `q-item` sizes itself to
 * the MD3 one-line list container — 56px — so the header grew to 56 and the
 * reservation was corrected on mount. That correction moved everything below
 * the header down by 6px, once, on a 1280px viewport (Lighthouse: CLS 0.0044;
 * zero below 1280, where the nav is hidden and the toolbar's 50px wins).
 *
 * The nav-item shortcut asks for a 40px row, and that request was inert: one
 * utility class against the preset's one `.q-item` class ties, and the preset's
 * rule is emitted later. Only a preflight with two classes wins.
 *
 * So these assertions pin the two halves of that arrangement — the rule that
 * wins, and the value it shares with the shortcut — because a header that is
 * one pixel taller than its reservation produces exactly the shift this test
 * was written for, and no other gate in the repo looks at it.
 */

/** Every preflight's CSS, in the order UnoCSS receives it. */
function allPreflightCSS(): string {
  return ssgPreflights
    .map((preflight) => {
      // The preflights in `design.ts` take no context, so calling them with
      // none is safe; the cast is only to drop UnoCSS's required argument.
      const getCSS = preflight.getCSS as unknown as
        | (() => string | Promise<string>)
        | undefined
      const css = getCSS?.()

      return typeof css === 'string' ? css : ''
    })
    .join('\n')
}

/**
 * The declarations of the first rule whose selector is exactly `selector`.
 *
 * The selector is spelled out on purpose: the whole point of the rule is *which*
 * selector it uses, so a rename has to come past this test rather than around it.
 */
function declarationsOf(selector: string): string | undefined {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const rule = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(allPreflightCSS())

  return rule?.[1]
}

/** Class tokens in a selector — the only specificity component that matters here. */
function classCount(selector: string): number {
  return selector.match(/\.[\w-]+/g)?.length ?? 0
}

const NAV_ROW = '.ssg-header__nav .q-item'

describe('header height matches the reservation Quasar writes at SSR time', () => {
  it('pins the nav row to 40px in a rule that out-specifies the preset', () => {
    const declarations = declarationsOf(NAV_ROW)

    expect(declarations).toBeDefined()
    expect(declarations).toMatch(/min-height:\s*40px/)

    // A single class ties with the preset's `.q-item` and loses the cascade.
    // Losing is silent — the row just stays 56px and the header with it — so the
    // specificity is asserted, not assumed.
    expect(classCount(NAV_ROW)).toBeGreaterThan(1)
  })

  it('asks for the same row height in the shortcut and in the preflight', () => {
    const shortcut = ssgShortcuts.find(
      (entry) => Array.isArray(entry) && entry[0] === 'ssg-header__nav-item'
    )
    const body = typeof shortcut?.[1] === 'string' ? shortcut[1] : ''
    const asked = /min-h-\[(\d+px)\]/.exec(body)?.[1]
    const declared = /min-height:\s*(\d+px)/.exec(declarationsOf(NAV_ROW) ?? '')

    expect(asked).toBeDefined()
    expect(declared?.[1]).toBe(asked)
  })
})
