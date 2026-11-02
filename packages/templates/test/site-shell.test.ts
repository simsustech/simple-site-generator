import { describe, expect, it } from 'vitest'
import SiteShell from '../src/shared/SiteShell.vue'
import { ssgShortcuts } from '../src/design.js'
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

describe('chrome labels and trust marks', () => {
  const dutchLabels = {
    skipToContent: 'Naar de inhoud',
    openNavigation: 'Menu openen',
    primary: 'Hoofdmenu',
    navigation: 'Navigatie',
    sections: 'Pagina’s',
    footer: 'Voettekst',
    contact: 'Contactgegevens',
    follow: 'Volg ons',
    moreOptions: 'Meer opties',
    backToTop: 'Terug naar boven'
  }

  it('names the invisible controls in the site’s own language', () => {
    // None of these strings is visible, so a site that translates only its page
    // copy leaves every one of them in English — and they are the first thing a
    // screen-reader user hears.
    const wrapper = mountWithQuasar(SiteShell, {
      props: { ...shellProps, extra: { labels: dutchLabels } }
    })

    expect(wrapper.find('a.ssg-skip-link').text()).toBe('Naar de inhoud')
    expect(
      wrapper.find('.ssg-header__menu-toggle').attributes('aria-label')
    ).toBe('Menu openen')
    expect(
      wrapper.find('#ssg-primary-navigation').attributes('aria-label')
    ).toBe('Hoofdmenu')
    expect(wrapper.find('footer nav').attributes('aria-label')).toBe(
      'Voettekst'
    )
  })

  it('falls back to the English labels when the site sets none', () => {
    const wrapper = mountWithQuasar(SiteShell, { props: shellProps })

    expect(wrapper.find('a.ssg-skip-link').text()).toBe('Skip to content')
    expect(
      wrapper.find('.ssg-header__menu-toggle').attributes('aria-label')
    ).toBe('Open navigation')
  })

  it('renders a declared trust mark, named and linked', () => {
    // A mark is an image of a word, so its accessible name cannot be empty, and
    // the theme switch cannot be the only thing in the footer a crawler reads.
    const wrapper = mountWithQuasar(SiteShell, {
      props: {
        ...shellProps,
        extra: {
          qualityMarks: [
            {
              name: 'Dibevo',
              imageUrl: '/dibevo.svg',
              url: 'https://dibevo.nl/'
            }
          ]
        }
      }
    })

    const mark = wrapper.find('.ssg-footer__mark')

    expect(mark.exists()).toBe(true)
    expect(mark.attributes('href')).toBe('https://dibevo.nl/')
    expect(mark.find('img').attributes('alt')).toBe('Dibevo')
    expect(mark.find('img').attributes('src')).toBe('/dibevo.svg')
    // Een SVG met alleen een viewBox heeft geen intrinsieke maat; zonder deze
    // twee attributen legt de browser de afbeelding op 0×0 neer en schildert
    // niets, zonder enige fout.
    expect(mark.find('img').attributes('width')).toBe('112')
    expect(mark.find('img').attributes('height')).toBe('48')
  })

  it("renders the builder's credit only when the site declares one", () => {
    // De oude site zette de bouwer in dezelfde regel als het bedrijf
    // ("© simsustech van Hemert Flowers"). Toen de shell in de kit kwam, verdween
    // die vermelding zonder dat iemand het merkte; een credit is een keuze van de
    // site, dus staat hij in `extra.credit` en niet in de template.
    const withCredit = mountWithQuasar(SiteShell, {
      props: { ...shellProps, extra: { credit: 'Website door simsustech' } }
    })

    expect(withCredit.find('.ssg-footer__credit').text()).toBe(
      'Website door simsustech'
    )
    // De regel over het bedrijf blijft staan; de credit komt eronder.
    expect(withCredit.find('.ssg-footer__legal').text()).toContain('Acme Corp')

    const without = mountWithQuasar(SiteShell, { props: shellProps })
    expect(without.find('.ssg-footer__credit').exists()).toBe(false)

    const blank = mountWithQuasar(SiteShell, {
      props: { ...shellProps, extra: { credit: '   ' } }
    })
    // Een lege `<p>` neemt nog steeds de marge van de voettekst in.
    expect(blank.find('.ssg-footer__credit').exists()).toBe(false)
  })

  it('drops a mark that has no image, and renders none when none are declared', () => {
    // `extra` is an open bag; a mark without an image would render the browser's
    // broken-image icon in the footer of every page.
    const withBroken = mountWithQuasar(SiteShell, {
      props: {
        ...shellProps,
        extra: { qualityMarks: [{ name: 'Dibevo', imageUrl: '' }] }
      }
    })

    expect(withBroken.find('.ssg-footer__marks').exists()).toBe(false)

    const without = mountWithQuasar(SiteShell, { props: shellProps })

    expect(without.find('.ssg-footer__marks').exists()).toBe(false)
  })
})

describe('the header gives up the navigation before the phone', () => {
  it('keeps the phone and the login from 1024px, and collapses the nav instead', () => {
    // A local business's number is the action most visitors want, so it is what
    // the header keeps. The row only fits if the *navigation* collapses: at
    // 1280-1439px a brand, a nav of six entries, the phone, the login and the
    // overflow control fit from 1280px only, which is where `xl` starts.
    const wrapper = mountWithQuasar(SiteShell, {
      props: {
        ...shellProps,
        extra: {
          phone: '0418 63 47 17',
          clientLoginUrl: 'https://app.example.test'
        }
      }
    })

    expect(wrapper.find('.ssg-header__phone').attributes('class')).toContain(
      'gt-sm'
    )
    expect(wrapper.find('.ssg-header__login').attributes('class')).toContain(
      'gt-sm'
    )
  })
})

describe('the hero band', () => {
  it('is a neutral surface, not the brand colour', () => {
    // A photograph of hay and grass on a green band has no edge of its own; the
    // two read as one flat plane. The brand colour stays in the action and the
    // footer, where it means something.
    const css = ssgShortcuts.find(
      (shortcut) =>
        Array.isArray(shortcut) && shortcut[0] === 'ssg-hero--tinted'
    ) as [string, string]

    expect(css[1]).toContain('--q-surface-container')
    expect(css[1]).not.toContain('--q-secondary-container')
  })
})
