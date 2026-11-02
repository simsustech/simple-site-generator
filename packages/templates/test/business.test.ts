import { describe, expect, it } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import BusinessLayout from '../src/business/Layout.vue'
import BusinessPage from '../src/business/Page.vue'
import Landing from '../src/business/Landing.vue'
import SiteShell from '../src/shared/SiteShell.vue'
import { buildJsonLd } from '../src/seo/jsonld.js'
import { menuPagesOf, pathOf, subpagesOf } from '../src/shared/nav.js'
import {
  mountPageInShell,
  mountWithQuasar,
  samplePages,
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

  // `cta` was a dead field here: the band rendered it, the band was cut back to
  // a title, and every page that declared one silently lost its button. The
  // reference site's contact page ended up with no action at all.
  it('renders the page action the frontmatter declares', () => {
    const wrapper = mountPageInShell(BusinessPage, {
      id: 'contact',
      title: 'Contact',
      cta: { message: 'Email us', href: 'mailto:hi@example.com' }
    })
    const action = wrapper.find('[data-ssg="page-cta"]')

    expect(action.exists()).toBe(true)
    expect(action.text()).toContain('Email us')
    expect(action.attributes('href')).toBe('mailto:hi@example.com')
  })

  it('renders an in-app route instead of a link', () => {
    const wrapper = mountPageInShell(BusinessPage, {
      id: 'services',
      title: 'Services',
      cta: { message: 'Ask for a quote', route: '/contact' }
    })

    expect(wrapper.find('[data-ssg="page-cta"]').attributes('href')).toBe(
      '/contact'
    )
  })

  it('renders no action when the page declares none', () => {
    const wrapper = mountPageInShell(BusinessPage, {
      id: 'about',
      title: 'About'
    })

    expect(wrapper.find('[data-ssg="page-cta"]').exists()).toBe(false)
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

  it('renders a subpage menu page as an item that opens a menu', () => {
    const wrapper = mountNav(navPages)
    const nav = wrapper.find('.ssg-header__nav')

    expect(nav.text()).toContain('Services')
    // `q-item` + `q-menu` is Quasar's native pair: the item is the trigger and
    // the menu positions, traps focus and handles Esc. `q-btn-dropdown` has no
    // active props, so it could not mark the group as open.
    expect(nav.find('.ssg-header__nav-item').exists()).toBe(true)
    expect(nav.find('.q-btn-dropdown').exists()).toBe(false)
  })

  it('renders a menu page without subpages as a navigation item', () => {
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

describe('business landing page', () => {
  const landingProps = {
    id: 'home',
    title: 'Dog boarding in Velddriel',
    description: 'Day care and boarding for dogs.',
    cta: {
      message: 'Read about boarding',
      route: '/boarding',
      secondary: { message: 'See the prices', route: '/prices' }
    },
    cards: [
      {
        header: 'Boarding',
        content: 'Overnight stays.',
        cta: { message: 'Boarding', route: '/boarding' }
      },
      {
        header: 'Day care',
        content: 'By the day.',
        cta: { message: 'Day care', route: '/daycare' }
      }
    ],
    images: [
      { name: 'Hero', src: '/images/hero.webp', caption: 'A dog on the field' }
    ],
    extra: { phone: '+31418634717', cardsHeading: 'Diensten' }
  }

  it('renders one h1 from the title and the description as the tagline', () => {
    // `Landing.vue` delegates the heading to `Hero`, which owns the document's
    // single `<h1>`; a second one would fail `ssg verify` on the built page.
    const wrapper = mountPageInShell(Landing, landingProps)

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe('Dog boarding in Velddriel')
    expect(wrapper.text()).toContain('Day care and boarding for dogs.')
  })

  it('renders the first image as the hero visual and reserves its space', () => {
    // The hero image is the LCP element: without width and height the page
    // shifts when it arrives, and `fetchpriority="high"` is what puts it ahead
    // of the deferred JavaScript.
    const wrapper = mountPageInShell(Landing, landingProps)
    const image = wrapper.find('.ssg-hero__image img')

    expect(image.exists()).toBe(true)
    expect(image.attributes('src')).toBe('/images/hero.webp')
    expect(image.attributes('alt')).toBe('A dog on the field')
    expect(image.attributes('width')).toBeTruthy()
    expect(image.attributes('height')).toBeTruthy()
    expect(image.attributes('fetchpriority')).toBe('high')
  })

  it("reserves the hero photo's own ratio, not a landscape default", () => {
    // The default pair is 1200×750 — landscape. A portrait hero under that
    // default reserves a box the wrong way round, and everything below the band
    // jumps when the file lands. A site that declares the photo's size gets a
    // box of that shape instead.
    const wrapper = mountPageInShell(Landing, {
      ...landingProps,
      images: [
        {
          name: 'Hero',
          src: '/images/hero.webp',
          width: 1000,
          height: 1333
        }
      ]
    })
    const image = wrapper.find('.ssg-hero__image img')

    expect(image.attributes('width')).toBe('1000')
    expect(image.attributes('height')).toBe('1333')
  })

  it('renders one card per service with its action', () => {
    const wrapper = mountPageInShell(Landing, landingProps)

    expect(wrapper.find('[data-ssg="bento"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Boarding')
    expect(wrapper.text()).toContain('Day care')
    expect(wrapper.find('.ssg-bento__heading').text()).toBe('Diensten')
  })

  it('takes the secondary action from cta.secondary before the phone number', () => {
    const wrapper = mountPageInShell(Landing, landingProps)
    const secondary = wrapper.find('[data-ssg="hero-secondary"]')

    expect(secondary.exists()).toBe(true)
    expect(secondary.text()).toBe('See the prices')
  })

  it('falls back to the phone number when the page declares no secondary action', () => {
    const wrapper = mountPageInShell(Landing, {
      ...landingProps,
      cta: { message: 'Read about boarding', route: '/boarding' }
    })
    const secondary = wrapper.find('[data-ssg="hero-secondary"]')

    expect(secondary.exists()).toBe(true)
    expect(secondary.text()).toBe('+31418634717')
    // The spaces are stripped for the dialler, not for the eye.
    expect(secondary.attributes('href')).toBe('tel:+31418634717')
  })

  it('renders no hero visual when the page declares no image', () => {
    const wrapper = mountPageInShell(Landing, {
      ...landingProps,
      images: undefined
    })

    expect(wrapper.find('.ssg-hero__image').exists()).toBe(false)
  })
})

describe('business landing page in a site that is not in English', () => {
  const dutch = {
    proofHeading: 'Wat klanten zeggen',
    proofFacts: 'Gecontroleerde gegevens',
    address: 'Adres',
    phone: 'Telefoon',
    serviceArea: 'Werkgebied',
    registration: 'KvK',
    insurance: 'Verzekering',
    insured: 'Verzekerd',
    notInsured: 'Niet verzekerd'
  }

  const props = {
    id: 'home',
    title: 'Pension en dagopvang',
    description: 'Opvang voor uw hond.',
    cta: {
      message: 'Lees meer',
      route: '/pension',
      secondary: { message: 'Bekijk de prijzen', route: '/prijzen' }
    },
    images: [{ name: 'Hero', src: '/images/hero.webp' }],
    extra: {
      phone: '0418 63 47 17',
      address: 'Vliertseweg 1a, Velddriel',
      labels: dutch
    }
  }

  it('takes the proof section’s headings and terms from the site', () => {
    // Every string in the proof block is invented by the component, so a Dutch
    // site that cannot set them renders "What customers say" above its Dutch
    // reviews — the block a visitor reads right before deciding to call.
    const wrapper = mountPageInShell(Landing, props)
    const proof = wrapper.find('[data-ssg="proof-section"]')

    expect(proof.text()).toContain('Wat klanten zeggen')
    expect(proof.text()).toContain('Gecontroleerde gegevens')
    expect(proof.text()).toContain('Adres')
    expect(proof.text()).toContain('Telefoon')
    expect(proof.text()).not.toContain('What customers say')
    expect(proof.text()).not.toContain('Verified details')
  })

  it('gives a link-shaped secondary action an arrow, not a phone', () => {
    // The icon is what makes the secondary button read as "call" at a glance;
    // on a page whose second action is another page, a phone icon promises a
    // dialler and delivers a navigation.
    const wrapper = mountPageInShell(Landing, props)
    const secondary = wrapper.find('[data-ssg="hero-secondary"]')

    expect(secondary.text()).toBe('Bekijk de prijzen')
    expect(secondary.html()).toContain('i-mdi-arrow-right')
    expect(secondary.html()).not.toContain('i-mdi-phone')
  })

  it('keeps the phone icon when the secondary action is the phone number', () => {
    const wrapper = mountPageInShell(Landing, {
      ...props,
      cta: { message: 'Lees meer', route: '/pension' }
    })
    const secondary = wrapper.find('[data-ssg="hero-secondary"]')

    expect(secondary.text()).toBe('0418 63 47 17')
    expect(secondary.html()).toContain('i-mdi-phone')
  })
})

describe('the proof section without reviews', () => {
  it('does not render an empty review column beside the facts', () => {
    // The grid is auto-fit, so an empty reviews column still takes a track and
    // the facts sit in the right half with nothing on the left. A site without
    // reviews — which is most of them at launch — showed exactly that.
    const wrapper = mountPageInShell(Landing, {
      id: 'home',
      title: 'Pension',
      extra: { address: 'Vliertseweg 1a, Velddriel' }
    })

    expect(wrapper.find('.ssg-proof-section__reviews').exists()).toBe(false)
    expect(wrapper.find('[data-ssg="proof-section"]').text()).toContain(
      'Vliertseweg 1a'
    )
  })
})

describe('the sticky bar on a business site', () => {
  const layoutProps = {
    title: 'Acme Plumbing',
    favicon: '/favicon.ico',
    pages: samplePages,
    tags: sampleTags,
    extra: {
      phone: '020 123 4567',
      clientLoginUrl: 'https://app.example.test',
      labels: { book: 'Reserveren', contact: 'Contact', call: 'Bel ons' }
    }
  }

  it('offers the contact page beside booking, not the phone', () => {
    // A bar whose second action is a phone number makes calling the reflex on a
    // site whose bookings arrive online. The contact page is a channel that works
    // at any hour, so it takes that slot when the site has one.
    const wrapper = mountWithQuasar(BusinessLayout, { props: layoutProps })
    const bar = wrapper.find('[data-ssg="sticky-cta"]')

    expect(bar.exists()).toBe(true)
    expect(bar.find('[data-ssg="sticky-contact"]').attributes('href')).toBe(
      '/contact'
    )
    expect(bar.text()).toContain('Contact')
    expect(bar.find('a[href^="tel:"]').exists()).toBe(false)
  })

  it('falls back to the phone on the contact page itself', async () => {
    const wrapper = mountWithQuasar(BusinessLayout, {
      props: layoutProps,
      path: '/contact'
    })

    // The memory router resolves its initial location asynchronously.
    await flushPromises()

    const bar = wrapper.find('[data-ssg="sticky-cta"]')

    expect(bar.find('[data-ssg="sticky-contact"]').exists()).toBe(false)
    expect(bar.find('a[href^="tel:"]').exists()).toBe(true)
  })
})

describe('the current page in the header', () => {
  it('is marked by Quasar itself, not by a hand-rolled comparison', async () => {
    // `q-item` with `to` receives `q-router-link--active` (and aria-current)
    // from Quasar's own router-link handling; the design system styles that
    // class. `q-btn` has no active props at all, which is why the header could
    // not show where the visitor was.
    const wrapper = mountWithQuasar(SiteShell, {
      props: { title: 'Acme', pages: samplePages, tags: sampleTags }
    })

    // The memory router resolves its initial location asynchronously, and the
    // active class is computed from the resolved route.
    await flushPromises()

    const home = wrapper.find('.ssg-header__nav-item')

    expect(home.classes()).toContain('q-router-link--active')
    expect(home.attributes('aria-current')).toBe('page')
  })
})
