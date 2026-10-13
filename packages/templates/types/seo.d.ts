/**
 * Type entry for `@simple-site-generator/templates/seo`.
 *
 * Kept in sync with `../src/seo/` (the `build.ts` entry), which is the source of
 * truth. See `./shared.d.ts` for why these are hand-written.
 */
import type { Plugin } from 'vite'
import type { SeoBusiness, SeoContext, SeoPage, SiteExtra } from './shared.js'

export type { SeoBusiness, SeoContext, SeoPage } from './shared.js'

export interface BuildMetaInput {
  page?: SeoPage
  site: SeoContext
  /** Current route path, e.g. `/guides`. */
  path: string
}

/** A Quasar `Meta` options object. Attribute values are attribute objects. */
export function buildMeta(input: BuildMetaInput): {
  title: string
  meta: Record<string, Record<string, string>>
  link: Record<string, Record<string, string>>
  htmlAttr?: { lang?: string }
  script: { ldjson: { type: string; innerHTML: string } }
}

/** Join a site origin and a route path into an absolute URL. */
export function absoluteUrl(base: string, path: string): string

export interface BuildJsonLdInput {
  page?: SeoPage
  site: SeoContext
  path: string
}

/** Schema.org `@graph` for one page. */
export function buildJsonLd(input: BuildJsonLdInput): Record<string, unknown>

export interface BuildSitemapInput {
  site: SeoContext
  pages: SeoPage[]
}

/** `sitemap.xml` for the whole site. `noindex` pages are excluded. */
export function buildSitemap(input: BuildSitemapInput): string

export interface BuildRobotsInput {
  site: SeoContext
  /** Extra paths to keep out of the crawl, on top of the defaults. */
  disallow?: string[]
}

/** `robots.txt`. `/404` is always disallowed. */
export function buildRobots(input: BuildRobotsInput): string

/** Apply the page's `<head>` tags. Called from the layout, never a page. */
export function useSeo(
  page: SeoPage | undefined,
  site: SeoContext,
  path: string
): void

export interface SsgSitemapOptions {
  /** Site identity, read from the `ssg` block of `vitrify.config.ts`. */
  site: SeoContext
  /** Absolute path to `src/pages`. */
  pagesDir: string
  /** Absolute path to the build output root (`dist`). */
  distDir: string
  /** Extra paths to keep out of the crawl, on top of the default `/404`. */
  disallow?: string[]
}

/** Vite plugin that writes `sitemap.xml` and `robots.txt` on `closeBundle`. */
export function ssgSitemap(options: SsgSitemapOptions): Plugin
