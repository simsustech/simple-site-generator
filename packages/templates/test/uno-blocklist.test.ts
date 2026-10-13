import { createGenerator, presetUno } from 'unocss'
import { describe, expect, it } from 'vitest'
import { ssgUnoConfig } from '../src/design.js'

/**
 * Behavioural test for the design system's `blocklist`.
 *
 * Not "is the array correct" but "does the generator actually refuse" — the
 * candidate is extracted from markup, so a test that only read the config would
 * pass while the emitted CSS still contained `.h1 { height: .25rem }`.
 *
 * The reason this matters: `h1` is a plausible *class* name. A CMS, a
 * copy-pasted block, or a design system that names its heading levels that way
 * will eventually put `class="h1"` in a page, and it would silently collapse to
 * 4px tall — with nothing in the source to explain it, because the rule came
 * from a `<h1>` tag elsewhere in the project.
 */
async function generate(content: string): Promise<string> {
  const uno = await createGenerator({
    presets: [presetUno()],
    ...ssgUnoConfig
  })

  return (await uno.generate(content)).css
}

describe('design system blocklist', () => {
  it('refuses a heading tag name as a height utility', async () => {
    // Both the tag and a hand-written class, because either one extracts `h1`.
    const css = await generate(
      `
        <h1>from the tag</h1>
        <div class="h1 h2 h3 h4 h5 h6">from a class</div>
      `
    )

    for (const level of [1, 2, 3, 4, 5, 6]) {
      expect(css).not.toMatch(new RegExp(`\\.h${level}\\{`))
    }
  })

  it('still emits the dashed height utilities', async () => {
    // `h-1` is the real spelling and must survive the blocklist.
    const css = await generate('<div class="h-1 h-40px"></div>')

    expect(css).toMatch(/\.h-1\{/)
    expect(css).toMatch(/\.h-40px\{/)
  })

  it('still emits the design system steps and spacing', async () => {
    const css = await generate(
      '<p class="text-step-1 mt-space-3 ssg-prose"></p>'
    )

    expect(css).toMatch(/\.mt-space-3\{/)
    expect(css).toContain('ssg-prose')
  })
})
