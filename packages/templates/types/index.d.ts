/**
 * Type entry for `@simple-site-generator/templates`.
 *
 * The component exports are typed as Vue's `Component`: the package's props are
 * declared with `defineProps`, and a declaration build is not available with the
 * TypeScript 7 native port (see `./shared.d.ts`).
 */
import type { Component } from 'vue'

export type {
  LayoutProps,
  PageProps,
  PageContentProps,
  SeoBusiness,
  SeoContext,
  SeoPage,
  SiteExtra,
  SitePage,
  SiteThing
} from './shared.js'

export { default as SiteShell } from './components.js'
export { default as SiteHeader } from './components.js'
export { default as SiteFooter } from './components.js'
export { default as SkipLink } from './components.js'
export { default as CtaButton } from './components.js'
export { default as Hero } from './components.js'
export { default as ProofStrip } from './components.js'
export { default as PageContent } from './components.js'

/** Shift every ATX markdown heading down one level. */
export function demoteHeadings(markdown: string): string

/** A Vue SFC exported by this package. */
export type TemplateComponent = Component
