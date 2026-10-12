import type { SeoBusiness, SeoContext, SeoPage } from '../shared/types.js'
import { absoluteUrl } from './url.js'

export interface BuildJsonLdInput {
  page?: SeoPage
  site: SeoContext
  path: string
}

/**
 * Structured data for one page.
 *
 * Composed from three sources so a page author never writes JSON-LD by hand:
 *   - the business (`LocalBusiness` + NAP + opening hours) from site config,
 *   - the page itself (`WebPage`),
 *   - the optional per-page `faq:` block (`FAQPage`).
 *
 * Emitted as a `@graph` so the entities can reference each other by `@id`
 * instead of being duplicated.
 */
export function buildJsonLd({ page, site, path }: BuildJsonLdInput) {
  const canonical = absoluteUrl(site.url, path)
  const businessId = `${site.url.replace(/\/+$/, '')}/#business`

  const graph: Record<string, unknown>[] = []

  const business = buildBusiness(site, businessId)
  if (business) graph.push(business)

  const webPage: Record<string, unknown> = {
    '@type': 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: page?.title ?? site.title,
    inLanguage: site.lang ?? 'en',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${site.url.replace(/\/+$/, '')}/#website`,
      url: site.url,
      name: site.title
    }
  }

  if (page?.description) webPage.description = page.description
  if (business) webPage.about = { '@id': businessId }
  if (page?.lastmod) webPage.dateModified = page.lastmod

  graph.push(webPage)

  if (page?.breadcrumbs?.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumbs`,
      itemListElement: page.breadcrumbs.map((name, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name,
        item:
          index === page.breadcrumbs!.length - 1
            ? canonical
            : absoluteUrl(
                site.url,
                page.breadcrumbs!.slice(0, index + 1).join('/')
              )
      }))
    })
  }

  if (page?.faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      mainEntity: page.faq.map((entry) => ({
        '@type': 'Question',
        name: entry.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: entry.answer
        }
      }))
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  }
}

function buildBusiness(
  site: SeoContext,
  businessId: string
): Record<string, unknown> | null {
  const configured: SeoBusiness | undefined = site.jsonLd?.business
  const extra = site.extra

  const telephone = configured?.telephone ?? extra?.phone
  const address = configured?.address

  // A LocalBusiness with no contact details is worse than no LocalBusiness: it
  // tells a crawler the business exists but cannot be reached. Skip it instead
  // of emitting a hollow entity.
  if (!configured && !telephone && !address && !extra?.address) return null

  const business: Record<string, unknown> = {
    '@type': configured?.type ?? 'LocalBusiness',
    '@id': businessId,
    name: configured?.name ?? site.title
  }

  if (configured?.description ?? site.description) {
    business.description = configured?.description ?? site.description
  }

  if (telephone) business.telephone = telephone
  if (configured?.email ?? extra?.email) {
    business.email = configured?.email ?? extra?.email
  }

  if (address || extra?.address) {
    business.address = {
      '@type': 'PostalAddress',
      ...address,
      ...(address ? {} : { streetAddress: extra?.address })
    }
  }

  if (configured?.geo) {
    business.geo = {
      '@type': 'GeoCoordinates',
      latitude: configured.geo.latitude,
      longitude: configured.geo.longitude
    }
  }

  if (configured?.areaServed?.length)
    business.areaServed = configured.areaServed
  if (configured?.priceRange) business.priceRange = configured.priceRange

  if (configured?.openingHours?.length) {
    business.openingHoursSpecification = configured.openingHours.map(
      (entry) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: entry.days,
        opens: entry.opens,
        closes: entry.closes
      })
    )
  }

  const sameAs = configured?.sameAs ?? []
  if (extra?.instagramUrl) sameAs.push(extra.instagramUrl)
  if (extra?.facebookUrl) sameAs.push(extra.facebookUrl)
  if (sameAs.length) business.sameAs = sameAs

  if (extra?.rating && extra.reviewCount) {
    business.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: extra.rating,
      reviewCount: extra.reviewCount,
      bestRating: 5
    }
  }

  return business
}
