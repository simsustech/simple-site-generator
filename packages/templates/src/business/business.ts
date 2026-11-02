import Layout from './Layout.vue'
import Page from './Page.vue'
import Landing from './Landing.vue'

/**
 * Business template module — a multi-page site for a local business: a home
 * page, service pages (nested under a menu dropdown), opening hours and contact.
 *
 * Two page components, because a local business has two kinds of page:
 *
 * - `Page` is the service page: a title band, the prose, a principles band and a
 *   card band. It is the default, so a page that names no component gets it.
 * - `Landing` is the front page: one action, one visual, a card per service.
 *   A page selects it with `page: Landing`.
 *
 * The `LocalBusiness` structured data (NAP, opening hours, service area,
 * aggregate rating) and the `BreadcrumbList` are produced by the shared SEO
 * layer from the same frontmatter and site config this module renders, so the
 * page and the structured data always agree.
 */
export { Landing, Layout, Page }
