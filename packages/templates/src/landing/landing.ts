import Layout from './Layout.vue'
import Page from './Page.vue'
import Landing from './Landing.vue'

/**
 * Landing template module — a conversion-oriented single page plus supporting
 * pages (contact, pricing, legal).
 *
 * `Landing` is resolved by the router from `page: Landing` in frontmatter
 * (`module[attributes.page]`), so a page opts into the full conversion layout
 * without any code change.
 */
export { Landing, Layout, Page }
