/**
 * Public surface of `@simple-site-generator/templates`.
 *
 * The template modules themselves are built as separate entries
 * (`./docs`, `./landing`, `./business`, `./plain`) and resolved by the generated
 * app through `virtual:ssg:template`. This module exports the shared layer and
 * the types those modules and the app both depend on.
 */

// Shared components — usable directly by an app that wants to compose its own
// page instead of using one of the four templates.
export { default as SiteShell } from './shared/SiteShell.vue'
export { default as SiteHeader } from './shared/SiteHeader.vue'
export { default as SiteFooter } from './shared/SiteFooter.vue'
export { default as SkipLink } from './shared/SkipLink.vue'
export { default as CtaButton } from './shared/CtaButton.vue'
export { default as Hero } from './shared/Hero.vue'
export { default as HeroDemo } from './shared/HeroDemo.vue'
export { default as PrincipleGrid } from './shared/PrincipleGrid.vue'
export { default as ProofStrip } from './shared/ProofStrip.vue'
export { default as PageContent } from './shared/PageContent.vue'

// Pure helpers.
export { demoteHeadings, demoteH1 } from './shared/headings.js'

// Types.
export type {
  LayoutProps,
  PageProps,
  PageContentProps,
  SiteExtra,
  SitePage,
  SiteThing
} from './shared/types.js'
