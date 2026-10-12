import type { SeoContext, SeoPage } from '../shared/types.js'
import { absoluteUrl } from './url.js'

export interface BuildSitemapInput {
  site: SeoContext
  pages: SeoPage[]
}

/** Minimal XML text escaping for values interpolated into the sitemap. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Route path for a page — the home page is the root, everything else is `/{id}`. */
function pathFor(page: SeoPage): string {
  return page.id === 'home' ? '/' : `/${page.id}`
}

/**
 * `sitemap.xml` for the whole site.
 *
 * Pages marked `noindex` are excluded outright: listing a URL while telling
 * crawlers not to index it is a contradiction that wastes crawl budget.
 */
export function buildSitemap({ site, pages }: BuildSitemapInput): string {
  const entries = pages
    .filter((page) => !page.noindex)
    .map((page) => {
      const lines = [
        `    <loc>${escapeXml(absoluteUrl(site.url, pathFor(page)))}</loc>`
      ]

      if (page.lastmod) {
        lines.push(`    <lastmod>${escapeXml(page.lastmod)}</lastmod>`)
      }

      return `  <url>\n${lines.join('\n')}\n  </url>`
    })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    ''
  ].join('\n')
}

export interface BuildRobotsInput {
  site: SeoContext
  /** Extra paths to keep out of the crawl, on top of the defaults. */
  disallow?: string[]
}

/**
 * `robots.txt`.
 *
 * `/404` is always disallowed — it is reachable by definition as the catch-all
 * route and has nothing to index.
 */
export function buildRobots({ site, disallow = [] }: BuildRobotsInput): string {
  const disallowed = ['/404', ...disallow]

  return [
    'User-agent: *',
    'Allow: /',
    ...disallowed.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${absoluteUrl(site.url, '/sitemap.xml')}`,
    ''
  ].join('\n')
}
