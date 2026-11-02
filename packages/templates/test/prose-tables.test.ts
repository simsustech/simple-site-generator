import { describe, expect, it } from 'vitest'
import { ssgPreflights, ssgSafelist, ssgShortcuts } from '../src/design.js'

/**
 * Seam: the design-system export.
 *
 * Markdown output is injected as HTML (`v-html`), so it carries no classes of
 * its own and every rule that styles it must live in a preflight. That is the
 * one place a missing rule is silent: no component names a class that would go
 * missing, `tsc` cannot see CSS, and the page still builds — it just renders a
 * price table as the browser's default, which is what this site had.
 *
 * These assertions pin the rules that exist and the property that keeps them
 * themable: no literal colour, only MD3 role tokens.
 */

const css = ssgPreflights.map((preflight) => preflight.getCSS()).join('\n')

/** The slice of the preflight that belongs to the prose table rules. */
function proseTableCss(): string {
  const start = css.indexOf('.ssg-prose :where(table)')
  const end = css.indexOf('.ssg-content__markdown:has(> table)')

  return start === -1 || end === -1 ? '' : css.slice(start, end)
}

describe('markdown table styling', () => {
  it('styles the table, its cells and its header row', () => {
    const block = proseTableCss()

    expect(block).not.toBe('')
    expect(block).toContain('border-collapse: collapse')
    expect(block).toContain('.ssg-prose :where(th, td)')
    expect(block).toContain('.ssg-prose :where(thead th, tr:first-child > th)')
    expect(block).toContain('border-block-end')
  })

  it('bounds the table cells with per-side borders, not a bare style', () => {
    // `border-style` alone paints the CSS initial width — 3px — so a hairline
    // becomes a box. Every border here names its width as well.
    const block = proseTableCss()
    const borderDeclarations = block.match(/border-block-end:[^;]+;/g) ?? []

    expect(borderDeclarations.length).toBeGreaterThanOrEqual(2)

    for (const declaration of borderDeclarations) {
      expect(declaration).toMatch(/border-block-end:\s*\d/)
    }
  })

  it('scrolls a wide table instead of letting it push the page sideways', () => {
    expect(css).toContain('.ssg-content__markdown:has(> table)')
    expect(css).toMatch(
      /\.ssg-content__markdown:has\(> table\) \{\s*overflow-x: auto;/
    )
  })

  it('takes every colour from a theme token, never a literal', () => {
    const block = proseTableCss()

    expect(block).toContain('var(--q-outline-variant')
    expect(block).toContain('var(--q-surface-container-low')
    expect(block).not.toMatch(/#[0-9a-f]{3,8}\b/i)
  })
})

describe('footer trust marks', () => {
  const names = ssgShortcuts
    .filter((shortcut) => Array.isArray(shortcut))
    .map((shortcut) => shortcut[0])

  it('declares a shortcut for the mark row, its link and its image', () => {
    expect(names).toEqual(
      expect.arrayContaining([
        'ssg-footer__marks',
        'ssg-footer__mark',
        'ssg-footer__mark-image'
      ])
    )
  })

  it('safelists them, so the row survives chunk splitting', () => {
    // `ssgSafelist` is what keeps a shortcut emitted when the scanner does not
    // see the markup that uses it — a class missing from it is a class whose CSS
    // silently never exists.
    expect(ssgSafelist).toEqual(
      expect.arrayContaining([
        'ssg-footer__marks',
        'ssg-footer__mark',
        'ssg-footer__mark-image'
      ])
    )
  })

  it('gives the mark a fixed box, so a viewBox-only SVG still paints', () => {
    // `width: auto` on an `img` whose SVG carries only a `viewBox` resolves to
    // zero: the element occupies the DOM, paints nothing, and reports no error.
    // A fixed width plus `object-contain` renders every ratio without distortion.
    const markImage = ssgShortcuts.find(
      (shortcut) =>
        Array.isArray(shortcut) && shortcut[0] === 'ssg-footer__mark-image'
    ) as [string, string]

    expect(markImage[1]).toContain('w-[112px]')
    expect(markImage[1]).toContain('max-h-[48px]')
    expect(markImage[1]).toContain('[object-fit:contain]')
    expect(markImage[1]).not.toContain('w-auto')
  })
})

describe('the page gutter', () => {
  it('is an alias for the preset gutter, not a second copy of the number', () => {
    // The page needs a name for its gutter because the tinted hero band cancels
    // it to run edge to edge. The padding itself belongs to the preset:
    // `unocss-preset-quasar` pads `q-page` with `var(--q-space-md)`. Writing the
    // literal 12px here made two sources of truth for one number.
    expect(css).toContain('--ssg-page-gutter: var(--q-space-md)')
    expect(css).not.toContain('--ssg-page-gutter: 12px')
    expect(css).not.toMatch(/\.ssg-shell \.q-page \{[^}]*padding/)
    expect(css).toMatch(
      /\.ssg-shell \.ssg-hero--tinted \{\s*margin-inline: calc\(-1 \* var\(--ssg-page-gutter\)\);/
    )
    // The band cancels the gutter above itself too: 12px of page background
    // between the header and a coloured band read as a seam, not a margin.
    expect(css).toMatch(
      /\.ssg-shell \.ssg-hero--tinted:first-child \{\s*margin-block-start: calc\(-1 \* var\(--ssg-page-gutter\)\);/
    )
  })

  it('gives the hero photo an edge of its own', () => {
    // On a coloured band a photograph without an edge bleeds into it.
    expect(css).toMatch(/\.ssg-hero__image img \{[^}]*box-shadow:/)
  })
})
