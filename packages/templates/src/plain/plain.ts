import Layout from './Layout.vue'
import Page from './Page.vue'

/**
 * Plain template module — the sober one: one service, one action, one price.
 *
 * The order of the page is the argument. A price card and the single action come
 * immediately after the heading, because a visitor comparing two or three quotes
 * is deciding whether this price is acceptable, not whether the company is
 * likeable. What the price includes, how the work runs (four steps) and the prose
 * follow — the prose argues for the number, it does not replace it.
 *
 * Frontmatter this module adds on top of the shared contract:
 *
 * ```yaml
 * cta:
 *   message: Offerte aanvragen
 *   route: /contact/#formulier
 * price:
 *   from: Vanaf
 *   amount: '€ 295'
 *   unit: per week
 *   note: Plaatsing is inclusief.
 *   tableCaption: Wat er in zit
 *   rows:
 *     - { label: Plaatsing, value: Inclusief }
 * steps:
 *   - { label: Aanvraag, text: Je stuurt het formulier in. }
 * ```
 *
 * `price` and `steps` are declared on `Page.vue`'s own prop type rather than in
 * `shared/types.ts`. With a type-only `defineProps`, a field that is absent from
 * the type is never exposed as a prop — which is why `business/Page.vue`
 * re-declares `breadcrumbs` the same way.
 *
 * An unfilled value is never a placeholder number: with no `price` the card is
 * not rendered at all, and with no `amount` it reads `€ ..` in the muted
 * unfilled style.
 */
export { Layout, Page }
