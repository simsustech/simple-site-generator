---
'@simple-site-generator/templates': minor
---

Make the business page's closing action an ending instead of a stray button.

`business/Page.vue` rendered the frontmatter `cta` in a wrapper carrying `mt-space-5` and nothing else.
It was spaced like a section without being one: no padding below it, so on a page whose content fills
the viewport the button sat 12px above the footer, and on a shorter page the page-fill left it stranded
in the middle of the gap. Left-aligned, with nothing between it and the cards above, it read as a
control that fell off the page.

The action closes the page as its own band now: a hairline on the article's gutter marks where the page
ends, and the band pads above and below it. A `cta.heading` turns it into a row — the sentence on the
left, the action on the right, stacking below `lg` — which uses the width instead of leaving a narrow
block floating in the middle of it. Without a heading the band is centred and the button carries the
ending alone.

The heading renders at `text-step-2`, the section-heading step: `text-step-3` measured 42.4px, the same
as the page's `h1`, so the closing line was competing with the page title.

No `ssg-section__inner` is nested inside: this page is an `article` that pads its own gutter, and the
shared inner adds a second `px-space-3` on top of it — measured in a browser, that put the button 16px
to the right of every heading and paragraph above it. `cta.heading` is new and optional, so existing
pages keep their content and gain only the band, the spacing and the alignment.
