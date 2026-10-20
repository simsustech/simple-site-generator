import { describe, expect, it } from 'vitest'
import BusinessPage from '../src/business/Page.vue'
import SiteShell from '../src/shared/SiteShell.vue'
import { buildJsonLd } from '../src/seo/jsonld.js'
import { menuPagesOf, pathOf, subpagesOf } from '../src/shared/nav.js'
import {
  mountPageInShell,
  mountWithQuasar,
  sampleTags
} from './support/mount.js'
import type { SeoContext, SitePage } from '../src/shared/types.js'

/**
 * Seam S2 — the business template render, plus seam S3 for the structured data
 * it pairs with.
 *
 * Pages are mounted **inside the shell**, because a bare `q-page` outside a
 * `q-page-container` renders nothing at all.
 *
 * The plan assigns step 6 to the E2E layer (nested page reachable from the nav,
 * breadcrumb JSON-LD, NAP and opening hours in `LocalBusiness`). Those need a
 * served built site, which arrives with step 7. Navigation *resolution* is
 * asserted against the pure `nav.ts` module rather than by reading a Quasar
 * dropdown's HTML — `q-menu` does not render its contents until it is opened.
 */

const businessExtra = {
  phone: '+31201234567',
  address: 'Keizersgracht 1, 1015 CD Amsterdam',
  serviceArea: ['Amsterdam', 'Haarlem'],
  rating: 4.9,
  reviewCount: 214,
  instagramUrl: 'https://instagram.com/acme'
}

const site: SeoContext = {
  title: 'Acme Plumbing',
  url: 'https://acme.test',
  lang: 'en',
  extra: businessExtra,
  jsonLd: {
    business: {
      type: 'Plumber',
      address: {
        streetAddress: 'Keizersgracht 1',
        postalCode: '1015 CD',
        addressLocality: 'Amsterdam',
        addressCountry: 'NL'
      },
      areaServed: ['Amsterdam', 'Haarlem'],
      openingHours: [
        {
          days: ['Mo', 'Tu', 'We', 'Th', 'Fr'],
          opens: '08:00',
          closes: '18:00'
        },
        { days: ['Sa'], opens: '09:00', closes: '14:00' }
      ]
    }
  }
}

describe('business template page', () => {
  const pageProps = {
    id: 'services/leaks',
    title: 'Leak repair',
    description: 'Same-day leak repair across Amsterdam.',
    content: '# What we do\n\nWe find and fix leaks.',
    breadcrumbs: ['Services', 'Leak repair'],
    cards: [
      {
        header: 'Emergency repair',
        content: 'Within 60 minutes.',
        cta: { message: 'Book now', route: '/contact' }
      }
    ]
  }

  it('renders exactly one h1', () => {
    const wrapper = mountPageInShell(BusinessPage, pageProps)

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe('Leak repair')
  })

  it('renders a breadcrumb trail with the current page as the last crumb', () => {
    const wrapper = mountPageInShell(BusinessPage, pageProps)
    const crumbs = wrapper.find('[data-ssg="breadcrumbs"]')

    expect(crumbs.exists()).toBe(true)
    expect(crumbs.text()).toContain('Services')
    expect(crumbs.text()).toContain('Leak repair')
    expect(crumbs.find('[aria-current="page"]').exists()).toBe(true)
    expect(crumbs.find('[aria-current="page"]').text()).toContain('Leak repair')
  })

  it('omits breadcrumbs on a top-level page', () => {
    const wrapper = mountPageInShell(BusinessPage, {
      id: 'home',
      title: 'Home'
    })

    expect(wrapper.find('[data-ssg="breadcrumbs"]').exists()).toBe(false)
  })

  it('renders service cards as tiles', () => {
    const wrapper = mountPageInShell(BusinessPage, pageProps)

    expect(wrapper.find('[data-ssg="bento"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Emergency repair')
  })

  it('takes the card band heading from the site, per page', () => {
    // A multilingual site supplies the word per page rather than accepting the
    // English default — the heading is a label, not page content.
    const wrapper = mountPageInShell(BusinessPage, {
      ...pageProps,
      extra: { cardsHeading: 'Diensten' }
    })

    expect(wrapper.find('.ssg-business__cards-heading').text()).toBe('Diensten')
  })

  it('falls back to the English card band heading', () => {
    const wrapper = mountPageInShell(BusinessPage, pageProps)

    expect(wrapper.find('.ssg-business__cards-heading').text()).toBe('Services')
  })

  it('renders list content (opening hours, contact details)', () => {
    const wrapper = mountPageInShell(BusinessPage, {
      id: 'openingtimes',
      title: 'Opening hours',
      lists: [
        {
          header: 'Opening hours',
          items: [{ label: 'Monday to Friday', caption: '08:00 – 18:00' }]
        }
      ]
    })

    expect(wrapper.text()).toContain('Opening hours')
    expect(wrapper.text()).toContain('Monday to Friday')
    expect(wrapper.text()).toContain('08:00 – 18:00')
  })
})

const navPages: SitePage[] = [
  { id: 'home', title: 'Home', label: 'Home', tags: ['menu'] },
  {
    id: 'services',
    title: 'Services',
    label: 'Services',
    tags: ['menu'],
    subpages: ['services/leaks', 'services/boilers']
  },
  { id: 'services/leaks', title: 'Leak repair', label: 'Leak repair' },
  { id: 'services/boilers', title: 'Boiler service', label: 'Boiler service' }
]

describe('navigation resolution', () => {
  it('selects only pages tagged for the menu', () => {
    expect(menuPagesOf(navPages).map((page) => page.id)).toEqual([
      'home',
      'services'
    ])
  })

  it('keeps pages from another language out of the menu', () => {
    // A site serving `nl/` pages: without this the Dutch page's menu is the
    // English one, because `menu` is what the English pages carry.
    const bilingual: SitePage[] = [
      { id: 'home', label: 'Home', tags: ['menu'], lang: 'en-GB' },
      { id: 'services', label: 'Services', tags: ['menu'], lang: 'en-GB' },
      { id: 'nl', label: 'Home', tags: ['menu'], lang: 'nl' },
      { id: 'nl/services', label: 'Diensten', tags: ['menu'], lang: 'nl' }
    ]

    expect(menuPagesOf(bilingual, 'nl').map((page) => page.id)).toEqual([
      'nl',
      'nl/services'
    ])
    expect(menuPagesOf(bilingual, 'en-GB').map((page) => page.id)).toEqual([
      'home',
      'services'
    ])
  })

  it('keeps a page that declares no language in every menu', () => {
    // The previous behaviour, deliberately: a single-language site declares no
    // language anywhere, and its menu must not empty itself out.
    expect(menuPagesOf(navPages, 'nl').map((page) => page.id)).toEqual([
      'home',
      'services'
    ])
  })

  it('resolves subpage ids to the pages themselves', () => {
    const services = navPages[1]

    expect(subpagesOf(services, navPages).map((page) => page.id)).toEqual([
      'services/leaks',
      'services/boilers'
    ])
  })

  it('drops subpage ids that resolve to nothing', () => {
    const withGhost: SitePage = {
      id: 'services',
      label: 'Services',
      subpages: ['services/ghost', 'services/leaks']
    }

    expect(subpagesOf(withGhost, navPages).map((page) => page.id)).toEqual([
      'services/leaks'
    ])
  })

  it('maps the home page to the root path and others to /id', () => {
    expect(pathOf({ id: 'home' })).toBe('/')
    expect(pathOf({ id: 'services/leaks' })).toBe('/services/leaks')
  })
})

describe('business header navigation', () => {
  // The header is reached through the shell on purpose: `SiteHeader`'s root is a
  // `q-header`, which renders nothing outside a `q-layout` — exactly like
  // `q-page` outside a `q-page-container`. Mounting it standalone yields an empty
  // DOM and any assertion against it would be meaningless.
  function mountNav(pages: SitePage[]) {
    return mountWithQuasar(SiteShell, {
      props: { title: 'Acme', pages, tags: sampleTags }
    })
  }

  it('renders a subpage menu page as a dropdown', () => {
    const wrapper = mountNav(navPages)
    const nav = wrapper.find('.ssg-header__nav')

    expect(nav.text()).toContain('Services')
    // `.q-btn-dropdown` is Quasar's own public class for the dropdown control,
    // so this asserts the branch without counting internal buttons.
    expect(nav.find('.q-btn-dropdown').exists()).toBe(true)
  })

  it('renders a menu page without subpages as a plain navigation button', () => {
    const wrapper = mountNav([
      { id: 'pricing', label: 'Pricing', tags: ['menu'] }
    ])
    const nav = wrapper.find('.ssg-header__nav')

    expect(nav.text()).toContain('Pricing')
    expect(nav.find('.q-btn-dropdown').exists()).toBe(false)
  })
})

describe('business structured data', () => {
  const graph = buildJsonLd({ page: { id: 'home' }, site, path: '/' })['@graph']
  const business = graph.find((node) => node['@type'] === 'Plumber') as Record<
    string,
    any
  >

  it('publishes a LocalBusiness with NAP and service area', () => {
    expect(business.name).toBe('Acme Plumbing')
    expect(business.telephone).toBe('+31201234567')
    expect(business.address.postalCode).toBe('1015 CD')
    expect(business.address.addressLocality).toBe('Amsterdam')
    expect(business.areaServed).toEqual(['Amsterdam', 'Haarlem'])
  })

  it('publishes opening hours as OpeningHoursSpecification', () => {
    expect(business.openingHoursSpecification).toHaveLength(2)
    expect(business.openingHoursSpecification[0]['@type']).toBe(
      'OpeningHoursSpecification'
    )
    expect(business.openingHoursSpecification[0].opens).toBe('08:00')
    expect(business.openingHoursSpecification[1].dayOfWeek).toEqual(['Sa'])
  })

  it('includes the social profile in sameAs', () => {
    expect(business.sameAs).toContain('https://instagram.com/acme')
  })

  it('publishes a BreadcrumbList for a nested page', () => {
    const nested = buildJsonLd({
      page: {
        id: 'services/leaks',
        title: 'Leak repair',
        breadcrumbs: ['Services', 'Leak repair']
      },
      site,
      path: '/services/leaks'
    })['@graph']

    const crumbs = nested.find(
      (node) => node['@type'] === 'BreadcrumbList'
    ) as Record<string, any>

    expect(crumbs.itemListElement.map((item: any) => item.name)).toEqual([
      'Services',
      'Leak repair'
    ])
    expect(crumbs.itemListElement[1].item).toBe(
      'https://acme.test/services/leaks'
    )
  })
})
