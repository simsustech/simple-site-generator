/**
 * Build-time entry point for the SEO surface.
 *
 * Deliberately free of Vue and Quasar imports: this module is loaded by a Node
 * process (the app's `ssgSitemap` Vite plugin) where importing `.vue` files or
 * the Quasar runtime would fail. `index.ts` re-exports the same functions for
 * app code, but that entry also pulls in components — so build tooling must
 * import from here instead.
 */
export { buildMeta, absoluteUrl } from './meta.js'
export type { BuildMetaInput } from './meta.js'

export { buildJsonLd } from './jsonld.js'
export type { BuildJsonLdInput } from './jsonld.js'

export { buildSitemap, buildRobots } from './sitemap.js'
export type { BuildSitemapInput, BuildRobotsInput } from './sitemap.js'

// The build-time Vite plugin that writes sitemap.xml/robots.txt. Exported from
// this entry so `vitrify.config.ts` can import it by package specifier — a config
// file is transpiled on its own and cannot import project `./src` TypeScript.
export { ssgSitemap } from './sitemap-plugin.js'
export type { SsgSitemapOptions } from './sitemap-plugin.js'

export type { SeoBusiness, SeoContext, SeoPage } from '../shared/types.js'
