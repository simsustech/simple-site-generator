import { describe, expect, test } from 'vitest'
import { buildJsonLd } from '../src/seo/jsonld.js'
import { absoluteUrl, buildMeta } from '../src/seo/meta.js'
import { buildRobots, buildSitemap } from '../src/seo/sitemap.js'
import type { SeoContext, SeoPage } from '../src/shared/types.js'

/**
 * Seam S3 — the SEO builders. These are pure and deterministic, so they are
 * asserted directly rather than through a mounted component.
 */

const site: SeoContext = {
  title: 'Acme Plumbing',
  url: 'https://acme.test',
  description: 'Emergency plumbing in Amsterdam',
  favicon: '/favicon-96.png',
  image: 'https://acme.test/og.png',
  lang: 'en',
  twitter: '@acmeplumbing',
  extra: {
    phone: '+31201234567',
    email: 'info@acme.test',
    address: 'Keizersgracht 1, 1015 CD Amsterdam',
    instagramUrl: 'https://instagram.com/acme',
    rating: 4.9,
    reviewCount: 214
  },
  jsonLd: {
    business: {
      type: 'Plumber',
      areaServed: ['Amsterdam'],
      openingHours: [
        { days: ['Mo', 'Tu', 'We'], opens: '08:00', closes: '18:00' }
      ]
    }
  }
}

describe('absoluteUrl', () => {
  test('joins origin and path without doubling slashes', () => {
    expect(absoluteUrl('https://acme.test', '/guides')).toBe(
      'https://acme.test/guides'
    )
    expect(absoluteUrl('https://acme.test/', 'guides')).toBe(
      'https://acme.test/guides'
    )
    expect(absoluteUrl('https://acme.test', '/')).toBe('https://acme.test/')
  })
})

describe('buildMeta', () => {
  test('the home page title is just the site title', () => {
    expect(buildMeta({ page: { id: 'home' }, site, path: '/' }).title).toBe(
      'Acme Plumbing'
    )
  })

  test('an inner page title is suffixed with the site name', () => {
    expect(
      buildMeta({
        page: { id: 'guides', title: 'Guides' },
        site,
        path: '/guides'
      }).title
    ).toBe('Guides · Acme Plumbing')
  })

  test('emits meta tags as attribute objects, not bare strings', () => {
    // Quasar silently drops a string value here, so this shape is the fix for
    // the "tags never reach the document" defect.
    const { meta } = buildMeta({
      page: { id: 'guides', title: 'Guides', description: 'How to install' },
      site,
      path: '/guides'
    })

    expect(meta.description).toEqual({
      name: 'description',
      content: 'How to install'
    })
    expect(meta.ogTitle).toEqual({
      property: 'og:title',
      content: 'Guides'
    })
    expect(meta.ogUrl.content).toBe('https://acme.test/guides')
    expect(meta.twitterCard.content).toBe('summary_large_image')
    expect(meta.twitterSite.content).toBe('@acmeplumbing')
    expect(meta.ogLocale.content).toBe('en')
  })

  test('falls back to the site description when the page has none', () => {
    const { meta } = buildMeta({ page: { id: 'home' }, site, path: '/' })

    expect(meta.description.content).toBe('Emergency plumbing in Amsterdam')
  })

  test('marks noindex pages and leaves the rest indexable', () => {
    expect(
      buildMeta({ page: { id: 'home' }, site, path: '/' }).meta.robots.content
    ).toBe('index, follow')
    expect(
      buildMeta({ page: { id: '404', noindex: true }, site, path: '/404' }).meta
        .robots.content
    ).toBe('noindex, follow')
  })

  test('emits a canonical link as an attribute object', () => {
    const { link } = buildMeta({
      page: { id: 'guides' },
      site,
      path: '/guides'
    })

    expect(link.canonical).toEqual({
      rel: 'canonical',
      href: 'https://acme.test/guides'
    })
  })

  test('emits parseable JSON-LD in the ldjson script tag', () => {
    const { script } = buildMeta({
      page: { id: 'guides', title: 'Guides' },
      site,
      path: '/guides'
    })

    expect(script.ldjson.type).toBe('application/ld+json')

    const parsed = JSON.parse(script.ldjson.innerHTML)
    expect(parsed['@context']).toBe('https://schema.org')
    expect(Array.isArray(parsed['@graph'])).toBe(true)
  })

  test('sets html lang for localisation', () => {
    expect(
      buildMeta({ page: { id: 'home' }, site, path: '/' }).htmlAttr
    ).toEqual({
      lang: 'en'
    })
  })
})

describe('buildJsonLd', () => {
  test('includes a LocalBusiness entity with NAP, hours and rating', () => {
    const graph = buildJsonLd({ page: { id: 'home' }, site, path: '/' })[
      '@graph'
    ]

    const business = graph.find(
      (node) => node['@type'] === 'Plumber'
    ) as Record<string, any>

    expect(business).toBeDefined()
    expect(business.name).toBe('Acme Plumbing')
    expect(business.telephone).toBe('+31201234567')
    expect(business.address['@type']).toBe('PostalAddress')
    expect(business.address.streetAddress).toBe(
      'Keizersgracht 1, 1015 CD Amsterdam'
    )
    expect(business.openingHoursSpecification[0].dayOfWeek).toEqual([
      'Mo',
      'Tu',
      'We'
    ])
    expect(business.aggregateRating.ratingValue).toBe(4.9)
    expect(business.aggregateRating.reviewCount).toBe(214)
    expect(business.sameAs).toContain('https://instagram.com/acme')
  })

  test('omits the business entity entirely when there is nothing to describe', () => {
    const graph = buildJsonLd({
      page: { id: 'home' },
      site: { title: 'Empty', url: 'https://empty.test' },
      path: '/'
    })['@graph']

    expect(graph.some((node) => node['@type'] === 'LocalBusiness')).toBe(false)
    // The page entity is still there.
    expect(graph.some((node) => node['@type'] === 'WebPage')).toBe(true)
  })

  test('adds a BreadcrumbList for nested pages', () => {
    const graph = buildJsonLd({
      page: {
        id: 'guides/install',
        title: 'Install',
        breadcrumbs: ['Guides', 'Install']
      },
      site,
      path: '/guides/install'
    })['@graph']

    const crumbs = graph.find(
      (node) => node['@type'] === 'BreadcrumbList'
    ) as Record<string, any>

    expect(crumbs).toBeDefined()
    expect(crumbs.itemListElement).toHaveLength(2)
    expect(crumbs.itemListElement[0].name).toBe('Guides')
    expect(crumbs.itemListElement[1].item).toBe(
      'https://acme.test/guides/install'
    )
  })

  test('adds FAQPage entities from the faq frontmatter', () => {
    const graph = buildJsonLd({
      page: {
        id: 'pricing',
        faq: [{ question: 'Do you work weekends?', answer: 'Yes.' }]
      },
      site,
      path: '/pricing'
    })['@graph']

    const faq = graph.find((node) => node['@type'] === 'FAQPage') as Record<
      string,
      any
    >

    expect(faq.mainEntity[0].name).toBe('Do you work weekends?')
    expect(faq.mainEntity[0].acceptedAnswer.text).toBe('Yes.')
  })
})

describe('buildSitemap', () => {
  const pages: SeoPage[] = [
    { id: 'home', title: 'Home' },
    { id: 'guides', title: 'Guides', lastmod: '2026-10-01' },
    { id: 'secret', title: 'Secret', noindex: true }
  ]

  test('includes every indexable page with absolute URLs', () => {
    const xml = buildSitemap({ site, pages })

    expect(xml).toContain('<loc>https://acme.test/</loc>')
    expect(xml).toContain('<loc>https://acme.test/guides</loc>')
    expect(xml).toContain('<lastmod>2026-10-01</lastmod>')
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    )
  })

  test('excludes noindex pages', () => {
    const xml = buildSitemap({ site, pages })

    expect(xml).not.toContain('/secret')
  })

  test('escapes XML-unsafe characters in URLs', () => {
    const xml = buildSitemap({
      site: { ...site, url: 'https://acme.test?a=1&b=2' },
      pages: [{ id: 'home' }]
    })

    expect(xml).toContain('&amp;')
    expect(xml).not.toContain('&b=2')
  })
})

describe('buildRobots', () => {
  test('allows the site, disallows 404 and points at the sitemap', () => {
    const txt = buildRobots({ site })

    expect(txt).toContain('User-agent: *')
    expect(txt).toContain('Allow: /')
    expect(txt).toContain('Disallow: /404')
    expect(txt).toContain('Sitemap: https://acme.test/sitemap.xml')
  })

  test('accepts extra disallow entries', () => {
    expect(buildRobots({ site, disallow: ['/draft'] })).toContain(
      'Disallow: /draft'
    )
  })
})
