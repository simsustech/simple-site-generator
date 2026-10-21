import { describe, expect, it } from 'vitest'
import PlainLayout from '../src/plain/Layout.vue'
import PlainPage from '../src/plain/Page.vue'
import {
  mountPageInShell,
  mountWithQuasar,
  samplePages,
  sampleTags
} from './support/mount.js'

/**
 * Seam S2 — the plain template's render.
 *
 * Pages are mounted inside the shell, because a bare `q-page` outside a
 * `q-page-container` renders nothing at all.
 *
 * Two things are asserted here that no other test can see: the page's order
 * (price, action, then the rest) and the client-login guard. Both are the
 * template's actual argument, and both would survive a diff that broke them —
 * the right elements are present either way, only in the wrong place, or on a
 * site that has no login environment.
 */

const pageProps = {
  id: 'cameramast-huren',
  title: 'Cameramast huren',
  description: 'Een mobiele cameramast op locatie, met stroom en data.',
  content: '## Wat je krijgt\n\nBeelden van je terrein.',
  cta: { message: 'Offerte aanvragen', route: '/contact/#formulier' },
  price: {
    from: 'Vanaf',
    amount: '€ 295',
    unit: 'per week',
    note: 'Plaatsing is inclusief.',
    tableCaption: 'Wat er in zit',
    rows: [
      { label: 'Plaatsing', value: 'Inclusief' },
      { label: 'Verbruik', value: 'Inclusief' }
    ]
  },
  steps: [
    { label: 'Aanvraag', text: 'Je stuurt het formulier in.' },
    { label: 'Akkoord', text: 'We bellen je binnen een dag.' },
    { label: 'Plaatsing', text: 'De mast gaat mee naar de locatie.' },
    { label: 'Beelden', text: 'Je kijkt mee in je eigen omgeving.' }
  ]
}

const siteProps = {
  title: 'I See You',
  favicon: '/favicon.svg',
  pages: samplePages,
  tags: sampleTags,
  lang: 'nl'
}

describe('plain template page', () => {
  it('renders exactly one h1, taken from the page title', () => {
    const wrapper = mountPageInShell(PlainPage, pageProps)

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.get('h1').text()).toBe('Cameramast huren')
  })

  it('puts the price and the action before the prose', () => {
    // The order is the template's whole reason for existing: a visitor comparing
    // quotes is deciding whether the price is acceptable, not whether the company
    // is likeable. Prose first is the old site, at length.
    const wrapper = mountPageInShell(PlainPage, pageProps)
    const html = wrapper.html()

    const price = html.indexOf('€ 295')
    const action = html.indexOf('Offerte aanvragen')
    const prose = html.indexOf('Wat je krijgt')

    expect(price).toBeGreaterThan(-1)
    expect(action).toBeGreaterThan(-1)
    expect(prose).toBeGreaterThan(-1)

    expect(price).toBeLessThan(action)
    expect(action).toBeLessThan(prose)
  })

  it('renders the included-items list as a real table with row headings', () => {
    // What is included and what each part costs is tabular data. A screen reader
    // can walk a table cell by cell, with each row named by its heading; a run-on
    // sentence of the same facts cannot be reviewed with a thumb.
    const wrapper = mountPageInShell(PlainPage, pageProps)

    expect(wrapper.findAll('table')).toHaveLength(1)
    expect(wrapper.get('table caption').text()).toBe('Wat er in zit')

    const heads = wrapper
      .findAll('tbody th[scope="row"]')
      .map((head) => head.text())

    expect(heads).toEqual(['Plaatsing', 'Verbruik'])
  })

  it('renders the four steps as an ordered list', () => {
    // The numbering is the information: this is a sequence, and `<ol>` says so
    // without a decorative digit being read out a second time.
    const wrapper = mountPageInShell(PlainPage, pageProps)

    expect(wrapper.findAll('.ssg-plain__steps ol li')).toHaveLength(4)
    expect(wrapper.get('.ssg-plain__steps ol li').text()).toContain('Aanvraag')
  })

  it('renders no price block at all when the page has no price yet', () => {
    // An unfilled price must not be a placeholder number. Without `price` the
    // page simply has no price card, and the open space is the owner's to fill.
    const wrapper = mountPageInShell(PlainPage, {
      ...pageProps,
      price: undefined
    })

    expect(wrapper.findAll('.ssg-plain__price')).toHaveLength(0)
    expect(wrapper.text()).not.toContain('€')
  })
})

describe('plain template layout', () => {
  const login = 'https://klant.iseeyou.test/'

  it('renders the client login link when the site sets an address', () => {
    const wrapper = mountWithQuasar(PlainLayout, {
      props: { ...siteProps, extra: { clientLoginUrl: login } }
    })

    const buttons = wrapper.findAll('[data-ssg="client-login"]')

    expect(buttons.length).toBeGreaterThan(0)
    expect(buttons[0].attributes('href')).toBe(login)
    // A new tab, and the site's own words as the accessible name. The label is
    // the site's because the shared chrome does not know what language the site
    // speaks; the link still leaves the site, which `target` announces.
    expect(buttons[0].attributes('target')).toBe('_blank')
    expect(buttons[0].attributes('rel')).toBe('noopener')
    expect(buttons[0].attributes('aria-label')).toBe('Client login')
  })

  it('takes the chrome labels from the site', () => {
    // The theme switch and the login are the only strings in the shared chrome
    // that are not a page's own, so a site in another language has to be able to
    // name them. English stays the fallback, asserted above and below.
    const wrapper = mountWithQuasar(PlainLayout, {
      props: {
        ...siteProps,
        extra: {
          clientLoginUrl: login,
          labels: { clientLogin: 'Klant login' }
        }
      }
    })

    const button = wrapper.get('[data-ssg="client-login"]')

    expect(button.text()).toBe('Klant login')
    expect(button.attributes('aria-label')).toBe('Klant login')
  })

  it('renders no client login link when the address is empty', () => {
    // A button that points nowhere is worse than no button: the plan is explicit
    // that the address arrives later, so this is the shipped state.
    for (const extra of [
      {},
      { clientLoginUrl: '' },
      { clientLoginUrl: undefined }
    ]) {
      const wrapper = mountWithQuasar(PlainLayout, {
        props: { ...siteProps, extra }
      })

      expect(wrapper.findAll('[data-ssg="client-login"]')).toHaveLength(0)
    }
  })

  it('shows the phone number in the header when the site sets one', () => {
    const wrapper = mountWithQuasar(PlainLayout, {
      props: { ...siteProps, extra: { phone: '06 13 80 69 68' } }
    })

    const phone = wrapper.get('.ssg-header a[href^="tel:"]')

    expect(phone.text()).toBe('06 13 80 69 68')
  })
})
