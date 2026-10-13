import { describe, expect, it } from 'vitest'
import { withLang } from '../src/shared/html-lang.js'

describe('withLang', () => {
  it('replaces the language Quasar wrote for the site default', () => {
    expect(withLang('lang=en-GB dir=ltr', 'nl')).toBe('lang=nl dir=ltr')
  })

  it('appends a language when the tag carries none', () => {
    expect(withLang('dir=ltr', 'nl')).toBe('dir=ltr lang=nl')
  })

  it('handles an empty attribute string', () => {
    expect(withLang('', 'nl')).toBe('lang=nl')
  })

  it('replaces only the lang attribute, not a similar one', () => {
    // `data-lang` must survive: a loose match would corrupt the attribute.
    expect(withLang('data-lang=en lang=en-GB', 'nl')).toBe(
      'data-lang=en lang=nl'
    )
  })
})
