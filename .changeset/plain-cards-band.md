---
'@simple-site-generator/templates': minor
---

Give the plain template the service-cards band.

A `plain` page that declares `cards` in frontmatter now renders them under the
prose, as the same `BentoGrid` the business template uses. Without it the band
existed only for one template: a site built on `plain` could link to its own
sub-pages from the prose, and nowhere else.

`BentoGrid` is exported from the package root so an app that keeps its own page
component (an interactive page, say) can render the same band rather than
reimplementing it.

Two rules carried over from the business template, because both are things a
tile gets wrong on its own:

- **A card's CTA needs both halves.** `cta.message` without a `cta.route` is a
  button that goes nowhere, so the pair is dropped unless both are present.
- **The band's heading is the site's word, not the template's.** It reads
  `extra.cardsHeading`, the key `cards-band-heading.md` introduced, so a Dutch
  site says "Toepassingen" without patching the template.
