---
"@simple-site-generator/templates": minor
---

Reserve the plain template's hero photograph, and stop dropping its clamp.

**The hero.** `plain/Page.vue` rendered `headerImage` as a bare `<img>` with no `width`/`height`, so the figure was 0 px tall until the photo decoded and everything below it jumped down when it landed. Measured on a built site with the photo held back 1.2 s: the figure went from 0 to 190 px at 360 wide and to 300 px at 1280, for CLS 0.157 and 0.016 — thirty-five times the header-height shift this kit fixed last. With the box reserved, both are 0 and the image is in place at first paint.

The numbers come from two new optional frontmatter fields, `headerImageWidth` and `headerImageHeight`. Unset, the hero reserves a landscape 1200×750 — the fallback `HeroImage` already uses — which trades a collapsed hero for a smaller settle if the photo is another shape. A site that knows its photo's size declares it, and the reserved box is the photo's own ratio: no crop, no reflow, `w-full h-auto` keeps the ratio while the image scales.

Deliberately not a `QSkeleton`: the photo's size is known when the page is authored, so the box can be reserved before the bytes arrive. A placeholder would need that same reserved space to avoid shifting, would swap content in front of the visitor, and would put the real image behind a JS-driven reveal — a worse LCP for the same result.

The size is a sibling field rather than an object in `headerImage` because sites copy this markup: a client site's own `HomePagina.vue` renders the same hero, and when `headerImage` briefly became `{ src, width, height }` its `<img>` lost its `src` and the hero vanished. `headerImage` stays the URL it always was; `test/hero-reservation.test.ts` pins both shapes.

**The clamp.** `ssg-header__brand-name` asked for `line-clamp-3`, which belongs to the default preset chain — this design system ships without it, so the utility was dropped at build time with one `[unocss] unmatched utility` warning and the name was cut off mid-word by the brand's own `overflow-hidden` instead of ellipsized after three lines. The clamp is now written as arbitrary properties, which any preset chain emits.
