---
'@simple-site-generator/templates': minor
---

Support translated pages, per-page language metadata and a header language switch.

## `@simple-site-generator/templates`

- **A page can declare its own language.** `lang` in frontmatter (or in route
  meta) drives `og:locale`, the JSON-LD `inLanguage`, and `<html lang>`. Before
  this, a Dutch page on an English site announced itself as English — and a
  declared language beats a search engine's own detection, so the translation
  would never be indexed as one (and it failed WCAG 3.1.1).

- **`alternates` emits an hreflang cluster.** Each entry becomes a
  `rel="alternate"` link plus `og:locale:alternate`. The list is emitted only
  when it names more than one language, so a single-language site does not point
  at itself.

- **The header carries a language switch**, built from the current page's
  `alternates` and filtered to the pages a visitor can actually reach: on
  desktop as toolbar links, on small screens in the overflow menu. A page with
  no alternates renders no switch at all.

- **`<html lang>` is written through the SSR context.** Quasar's Lang plugin
  owns that attribute — its Meta plugin filters `lang` and `dir` out of
  `htmlAttr` — so a page-level language has to be written where Quasar writes
  it. Doing that instead of swapping Quasar's language pack keeps the pack (and
  its whole string table) out of the client bundle, where it would have cost
  several kilobytes on *every* page to fix one attribute. `withLang` is a pure
  function with tests, because the SSR path can only be exercised through a real
  prerender.

## Fixed

- **Subpage menu links pointed at routes that do not exist.** The header linked
  a child as `/{parent}/{child}` while the router builds flat paths from page
  ids, so every dropdown item 404'd. Both the header and the drawer now use
  `pathOf`, the same helper the rest of the navigation uses.

- **An action with an `href` kept its button styling.** `CtaButton` rendered
  `mailto:`/`tel:` destinations as a bare underlined anchor, so a page whose
  primary action was "email us" looked like a broken page. `q-btn` handles
  `href` itself and stays a real link.

- **The page header illustration no longer tiles across the band.** The
  shortcut used `bg-no-repeat`/`bg-right`, which this preset does not define —
  an unmatched utility is dropped silently. The geometry now lives in
  `headerImageStyle`, with a gradient in the band's own colour so a long lede
  never reads across the artwork.

- **`headerImage` (and the other new frontmatter) is declared on `SitePage`.**
  A field missing from the props type is never exposed as a prop, so the value
  landed in `attrs` and the band silently rendered without its illustration.
