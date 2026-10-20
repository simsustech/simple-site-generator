import type { SeoContext, SeoPage } from '../shared/types.js'
import { buildJsonLd } from './jsonld.js'
import { absoluteUrl } from './url.js'

export { absoluteUrl } from './url.js'

export interface BuildMetaInput {
  page?: SeoPage
  site: SeoContext
  /** Current route path, e.g. `/guides`. */
  path: string
}

/**
 * A `<meta>` tag. An index signature (rather than an interface) is required:
 * Quasar's `meta` option is typed `Record<string, MetaTagOptions>` where
 * `MetaTagOptions = Record<string, any>`, and an interface without an index
 * signature is not assignable to it.
 *
 * The key in the surrounding map is only an identifier for override/dedupe.
 */
type MetaTag = Record<string, string>

/** A `<link>` tag. Same index-signature requirement as `MetaTag`. */
type LinkTag = Record<string, string>

/**
 * Quasar `Meta` plugin options for one page.
 *
 * This is the single place `<head>` tags are produced (see ADR-0001).
 *
 * The shape is the trap this function exists to remove: Quasar's `meta` and
 * `link` values are **attribute objects**, not strings — `meta: { description:
 * 'text' }` and `link: { canonical: 'https://…' }` are both silently dropped
 * (the tags never reach the document, they only land in `window.__Q_META__`).
 * The correct forms are `meta: { description: { name: 'description', content } }`
 * and `link: { canonical: { rel: 'canonical', href } }`.
 *
 * The result is a plain object so it can be asserted directly, without mounting
 * a component or an app.
 */
export function buildMeta({ page, site, path }: BuildMetaInput) {
  const canonical = absoluteUrl(site.url, path)
  const pageTitle = page?.title
  /**
   * The page's own name, without the site suffix — what `og:title` and
   * `twitter:title` carry.
   */
  const pageName = page?.headTitle ?? pageTitle ?? site.title
  /**
   * The document title. The site name goes first, so a tab, a bookmark or a
   * search result names the site even when the page's own title is long enough
   * to be truncated.
   *
   * `headTitle` replaces this outright, suffix and all. The suffix exists to
   * name the site *inside* a page's title; the front page is the site, so for
   * that one page the suffix would say it twice.
   */
  const title =
    page?.headTitle ?? (pageTitle ? `${site.title} | ${pageTitle}` : site.title)

  const description = page?.description ?? site.description ?? ''
  const image = page?.image ? absoluteUrl(site.url, page.image) : site.image

  // A page may declare its own language. Without this a Dutch page on an
  // English site ships `lang="en-GB"`, and because a declared language wins
  // over a crawler's own detection, the page is then served to the wrong
  // audience and the translation is never indexed as one.
  const lang = page?.lang ?? site.lang

  const meta: Record<string, MetaTag> = {
    description: { name: 'description', content: description },
    // Explicit rather than implied: pages marked `noindex` (including the 404
    // page) stay out of the index while still passing link equity on.
    robots: {
      name: 'robots',
      content: page?.noindex ? 'noindex, follow' : 'index, follow'
    },
    ogTitle: { property: 'og:title', content: pageName },
    ogDescription: { property: 'og:description', content: description },
    ogType: { property: 'og:type', content: 'website' },
    ogUrl: { property: 'og:url', content: canonical },
    ogSiteName: { property: 'og:site_name', content: site.title },
    twitterCard: {
      name: 'twitter:card',
      content: image ? 'summary_large_image' : 'summary'
    },
    twitterTitle: { name: 'twitter:title', content: pageName },
    twitterDescription: {
      name: 'twitter:description',
      content: description
    }
  }

  if (lang) {
    meta.ogLocale = {
      property: 'og:locale',
      content: lang.replace('-', '_')
    }
  }

  for (const [index, alternate] of (page?.alternates ?? []).entries()) {
    meta[`ogLocaleAlternate${index}`] = {
      property: 'og:locale:alternate',
      content: alternate.lang.replace('-', '_')
    }
  }

  if (image) {
    meta.ogImage = { property: 'og:image', content: image }
    meta.twitterImage = { name: 'twitter:image', content: image }
  }

  if (site.twitter) {
    meta.twitterSite = { name: 'twitter:site', content: site.twitter }
  }

  const link: Record<string, LinkTag> = {
    canonical: { rel: 'canonical', href: canonical }
  }

  // `hreflang` alternates. The key is an identifier only, so each alternate
  // needs its own: a repeated `alternate` key would overwrite the previous tag
  // and silently reduce a two-language cluster to one link.
  for (const [index, alternate] of (page?.alternates ?? []).entries()) {
    link[`alternate${index}`] = {
      rel: 'alternate',
      hreflang: alternate.lang,
      href: absoluteUrl(site.url, alternate.path)
    }
  }

  if (site.favicon) {
    link.icon = { rel: 'icon', href: site.favicon }
  }

  return {
    title,
    meta,
    link,
    htmlAttr: lang ? { lang } : undefined,
    script: {
      // Quasar writes `innerHTML` verbatim, so the JSON-LD is stringified here
      // and its own `</` sequences escaped.
      ldjson: {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(buildJsonLd({ page, site, path })).replace(
          /<\//g,
          '<\\/'
        )
      }
    }
  }
}
