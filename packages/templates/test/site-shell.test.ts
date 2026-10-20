import { describe, expect, it } from 'vitest'
import SiteShell from '../src/shared/SiteShell.vue'
import { mountWithQuasar, shellProps } from './support/mount.js'

/**
 * The shared shell is where the accessibility and navigation defects (D12) are
 * fixed once for every template. These assertions pin the properties that
 * Lighthouse's `bypass`, `link-name` and `button-name` audits check.
 */
describe('shared site shell', () => {
  it('renders a skip link that targets the main landmark', () => {
    const wrapper = mountWithQuasar(SiteShell, { props: shellProps })

    const skipLink = wrapper.find('a.ssg-skip-link')

    expect(skipLink.exists()).toBe(true)
    expect(skipLink.attributes('href')).toBe('#main')
    expect(wrapper.find('#main').exists()).toBe(true)
  })

  it('puts the skip link before the header in document order', () => {
    const wrapper = mountWithQuasar(SiteShell, { props: shellProps })

    const html = wrapper.html()
    const skipAt = html.indexOf('ssg-skip-link')
    const headerAt = html.indexOf('<header')

    expect(skipAt).toBeGreaterThan(-1)
    expect(headerAt).toBeGreaterThan(-1)
    expect(skipAt).toBeLessThan(headerAt)
  })

  it('provides the skip-link target without adding a main landmark', () => {
    const wrapper = mountWithQuasar(SiteShell, { props: shellProps })

    // The page component renders `q-page`, which Quasar renders as a `main`
    // element. If the shell also rendered one, every real page would carry two
    // main landmarks. The shell only guarantees the `#main` target exists.
    expect(wrapper.findAll('main')).toHaveLength(0)
    expect(wrapper.find('#main').exists()).toBe(true)
  })

  it('names the brand so the navigation identifies the site', () => {
    const wrapper = mountWithQuasar(SiteShell, { props: shellProps })

    expect(wrapper.find('.ssg-header__brand-name').text()).toBe('Acme Corp')
  })

  it('renders the navigation of the language being viewed', () => {
    // `route.meta.lang` wins; with a route table that declares none (as this
    // harness has) the site's own language is the fallback.
    const wrapper = mountWithQuasar(SiteShell, {
      props: {
        ...shellProps,
        lang: 'nl',
        pages: [
          { id: 'home', label: 'Home', tags: ['menu'] },
          { id: 'services', label: 'Services', tags: ['menu'], lang: 'en-GB' },
          { id: 'nl', label: 'Home', tags: ['menu'], lang: 'nl' },
          { id: 'nl/services', label: 'Diensten', tags: ['menu'], lang: 'nl' }
        ]
      }
    })

    expect(wrapper.text()).toContain('Diensten')
    expect(wrapper.text()).not.toContain('Services')
  })

  it('gives every icon-only control an accessible name', () => {
    const wrapper = mountWithQuasar(SiteShell, { props: shellProps })

    // Lighthouse's `button-name` audit: a control with no text must still expose
    // a name via aria-label, aria-labelledby or title.
    const unnamed = wrapper
      .findAll('button')
      .filter((button) => {
        const hasText = button.text().trim().length > 0
        const hasName =
          button.attributes('aria-label') ||
          button.attributes('aria-labelledby') ||
          button.attributes('title')

        return !hasText && !hasName
      })
      .map((button) => button.html())

    expect(unnamed).toEqual([])
  })

  it('exposes the menu toggle with its expanded state', () => {
    const wrapper = mountWithQuasar(SiteShell, { props: shellProps })

    const toggle = wrapper.find('.ssg-header__menu-toggle')

    expect(toggle.exists()).toBe(true)
    expect(toggle.attributes('aria-label')).toBe('Open navigation')
    expect(toggle.attributes('aria-expanded')).toBeDefined()
  })

  it('renders footer pages from the footer tag', () => {
    const wrapper = mountWithQuasar(SiteShell, { props: shellProps })

    const footer = wrapper.find('.ssg-footer')

    expect(footer.exists()).toBe(true)
    expect(footer.text()).toContain('Contact us')
    expect(footer.text()).toContain('Acme Corp')
  })
})
