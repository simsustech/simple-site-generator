import { describe, expect, it } from 'vitest'
import {
  UNSTYLED_HOOKS,
  checkClassCoverage,
  collectCssClasses,
  collectMarkupClasses
} from '../src/verify/class-coverage.js'

/**
 * Markup ↔ stylesheet coverage.
 *
 * The functions are pure so they can be tested directly, which matters more than
 * usual here: the check's whole value is that it fails **only** on a real gap. A
 * false positive gets the gate switched off, so the negative cases below are as
 * important as the positive one.
 */

describe('collectMarkupClasses', () => {
  it('collects tokens from class attributes', () => {
    const classes = collectMarkupClasses(
      '<div class="a b"><span class="c">x</span></div>'
    )

    expect([...classes].sort()).toEqual(['a', 'b', 'c'])
  })

  it('collapses whitespace and ignores an empty attribute', () => {
    const classes = collectMarkupClasses(
      '<div class="  a\n  b  "><i class=""></i></div>'
    )

    expect([...classes].sort()).toEqual(['a', 'b'])
  })

  it('ignores classes inside comments', () => {
    // The SEO surface check learned this the hard way: it counted tags inside an
    // HTML comment, so a page whose head was entirely commented out passed.
    const classes = collectMarkupClasses(
      '<!-- <div class="ssg-retired">x</div> --><p class="ssg-live">y</p>'
    )

    expect([...classes]).toEqual(['ssg-live'])
  })

  it('ignores classes inside a script, including JSON-LD', () => {
    const classes = collectMarkupClasses(
      '<script type="application/ld+json">{"@type":"Thing","class":"ssg-not-real"}</script>' +
        '<script>const x = "<i class=\\"ssg-also-not-real\\">"</script>' +
        '<p class="ssg-live">y</p>'
    )

    expect([...classes]).toEqual(['ssg-live'])
  })
})

describe('collectCssClasses', () => {
  it('collects a class from a plain rule', () => {
    expect([...collectCssClasses('.ssg-a{color:red}')]).toEqual(['ssg-a'])
  })

  it('collects classes nested in a media query', () => {
    // Regression: the first implementation stripped `{...}` blocks to isolate
    // selector text, which turned this into `@media(...){.a}` and then into
    // `@media(...)` — deleting the selector. It reported a styled class as
    // unstyled, and this is the case that caught it.
    const css =
      '@media (min-width:1024px){.ssg-business__band-copy--narrow{max-width:58%}}'

    expect([...collectCssClasses(css)]).toEqual([
      'ssg-business__band-copy--narrow'
    ])
  })

  it('handles a selector list and a descendant selector', () => {
    const css = '.a,.b{c:d}.outer .inner{e:f}.x:hover{g:h}'

    expect([...collectCssClasses(css)].sort()).toEqual([
      'a',
      'b',
      'inner',
      'outer',
      'x'
    ])
  })

  it('does not invent a class from a numeric value or a var fallback', () => {
    const css = '.a{transition:all 0.2s ease;color:var(--q-x,#fff)}'

    expect([...collectCssClasses(css)]).toEqual(['a'])
  })
})

describe('checkClassCoverage', () => {
  const page = (html: string) => [{ page: 'index.html', html }]

  it('passes when every ssg- class has a rule', () => {
    const issues = checkClassCoverage(
      page('<div class="ssg-a ssg-b">x</div>'),
      '.ssg-a{}.ssg-b{}'
    )

    expect(issues).toEqual([])
  })

  it('fails on an ssg- class no rule styles', () => {
    // The exact shape of the bug this check exists for: a shortcut vanished from
    // the design system and the class stayed in the markup.
    const issues = checkClassCoverage(
      page('<div class="ssg-a ssg-lost">x</div>'),
      '.ssg-a{}'
    )

    expect(issues).toEqual([{ page: 'index.html', className: 'ssg-lost' }])
  })

  it('ignores non-ssg classes, which the kit does not own', () => {
    // Quasar adds state classes at runtime (`q-btn--active`, `body--dark`) that
    // are legitimately absent from the prerendered sheet.
    const issues = checkClassCoverage(
      page('<div class="q-btn--active body--dark grid">x</div>'),
      '.q-btn{}'
    )

    expect(issues).toEqual([])
  })

  it('exempts the classes listed as unstyled hooks', () => {
    const hook = UNSTYLED_HOOKS[0]
    const issues = checkClassCoverage(page(`<div class="${hook}">x</div>`), '')

    expect(issues).toEqual([])
  })

  it('reports the page that uses the class', () => {
    const issues = checkClassCoverage(
      [
        { page: 'a.html', html: '<p class="ssg-ok">x</p>' },
        { page: 'b.html', html: '<p class="ssg-missing">y</p>' }
      ],
      '.ssg-ok{}'
    )

    expect(issues).toEqual([{ page: 'b.html', className: 'ssg-missing' }])
  })
})

describe('the unstyled-hook list', () => {
  it('only lists ssg- classes, and lists each once', () => {
    // The list is hand-maintained, so it is the one part of this check that can
    // rot. These two assertions are the cheap half of guarding it.
    for (const hook of UNSTYLED_HOOKS) {
      expect(hook.startsWith('ssg-')).toBe(true)
    }

    expect(new Set(UNSTYLED_HOOKS).size).toBe(UNSTYLED_HOOKS.length)
  })
})
