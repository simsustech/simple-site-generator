---
"@simple-site-generator/templates": minor
"simple-site-generator": minor
---

Give the business template a `Landing` page and make the shared chrome usable by a site that
is not in English: `extra.labels` now covers the skip link, the drawer, the menu, the footer,
the back-to-top control, the proof section, the gallery controls and the sticky bar; trust marks
render from `extra.qualityMarks`; markdown tables and the contact list get prose styling; the
gallery loses its 700px layout shift and gains named controls and a counter; the header keeps the
phone and the customer login from 1024px and lets the navigation collapse instead; the header
navigation and the drawer both mark the current page through Quasar's own `q-item`/router classes
rather than a hand-rolled comparison, with the marker carrying the contrast that the primary token
alone did not; the page gutter is an alias for the preset's own spacing token instead of a second
copy of its value, and the tinted hero band carries the same bottom margin as the business title
band so the first section no longer starts on the band's edge, and a tinted hero that opens the page
cancels the page gutter above itself so its colour meets the header instead of leaving a 12px seam; the business title band is compact —
the page's `description` is a meta description and is no longer printed as a lede, the padding is one
step smaller, the header's overflow menu no longer opens with a phone number, and the fixed action bar offers the
contact page beside booking instead of the phone; a `lists:` entry can be
marked `clientOnly`, which renders it inside `q-no-ssr` so a harvestable link never reaches the
prerendered HTML; the site-wide
social-card image is emitted as an absolute `og:image`. `ssg init` installs the `ssg` binary,
derives a valid package name from `--site-name`, pins the current release line, writes the host
(not the origin) into the Caddyfile and the rsync path, and emits `page: Landing` for `business`.

Three defects the simsustech reference site surfaced once it ran this work are fixed: the business
title band and its decorated variant were two complete page headers rendered on one element, so the
band's `display`, `flex-wrap` and bottom margin came from whichever rule the sheet put last — the base
is now layout-neutral and `--decorated` owns the row; the band's process graphic was an absolute
overlay sized by width, so the compact band clipped all but its top 100px — it is a flex child now and
the band grows to hold it; and the header's language switch had a class no shortcut defined, which
left it as an unstyled, underlined link in the browser's own colour (it was even listed as "unstyled
by design" in the verifier). The drawer's contact group also emitted a `<hr>` and a label as direct
children of `role="list"`, which fails Lighthouse's `aria-required-children` on any site that uses that
group. `ssg init` and the docs now match the templates package **by path** in the UnoCSS content scan:
a `link:`ed kit is resolved to its real location, so a name-only matcher scanned nothing and the site
lost the Quasar component CSS and every icon the templates render.

A page can now declare `alias`, which the scaffolded route table hands to Vue Router as extra paths —
for the English slug a page had before it was renamed. It is a client-side alias only: Vitrify's
`routesToPaths` reads `path` and ignores `alias`, so an alias writes no HTML and a static host answers
it with the 404 page. The README says so and pairs it with the `redir` a renamed page needs where the
site is served.

The `Landing` hero photo now carries an edge of its own: an outline-token hairline plus a two-layer
shadow whose darkest point is at the picture's own edge, and the cards' card radius instead of a
smaller one. The previous single soft shadow left the band under the picture only 30-44 levels darker
than itself and ramped away over 40px, which reads as a wash rather than as depth — and the ring that
was meant to define the edge sat at the same brightness as that wash.

`ssg check` now warns — without failing the run — when a page's body opens with a heading that repeats
its own `title` or `label`. The templates render `title` as the page's single `<h1>` above the markdown,
so a body that opens with the same words prints the title twice; on the reference site 22 of 38 pages
did exactly that, and it is invisible to `tsc`, to the SEO surface check and to the byte budgets. It is
a warning because a page may legitimately name a later section after itself.
