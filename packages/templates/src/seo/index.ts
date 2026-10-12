/**
 * SEO surface — the single place `<head>` tags, structured data, the sitemap and
 * robots.txt are produced.
 *
 * See `docs/adr/0001-seo-meta-production-point.md` for why the meta tags are
 * built from frontmatter at the layout layer rather than inside page components.
 */
export { buildMeta, absoluteUrl } from './meta.js'
export type { BuildMetaInput } from './meta.js'

export { buildJsonLd } from './jsonld.js'
export type { BuildJsonLdInput } from './jsonld.js'

export { buildSitemap, buildRobots } from './sitemap.js'
export type { BuildSitemapInput, BuildRobotsInput } from './sitemap.js'

export { useSeo } from './useSeo.js'

export type { SeoBusiness, SeoContext, SeoPage } from '../shared/types.js'
