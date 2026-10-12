import Layout from './Layout.vue'
import Page from './Page.vue'
import '../shared/tokens.css'

/**
 * Business template module — a multi-page site for a local business: a home
 * page, service pages (nested under a menu dropdown), opening hours and contact.
 *
 * The `LocalBusiness` structured data (NAP, opening hours, service area,
 * aggregate rating) and the `BreadcrumbList` are produced by the shared SEO
 * layer from the same frontmatter and site config this module renders, so the
 * page and the structured data always agree.
 */
export { Layout, Page }
