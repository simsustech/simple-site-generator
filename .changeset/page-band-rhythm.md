---
'@simple-site-generator/templates': patch
---

Give the first band of a page its section rhythm back.

`unocss-preset-quasar` gives `.q-page` a padding of `var(--q-space-md)` — 12px — and every
page template puts `ssg-section` on that same root. Equal specificity, so the preset's rule won
on source order and the section padding never applied: the first band of every page started
12px under the header instead of at `space-5`, which reads as content shoved against the header
rather than a page that begins. Measured on a business page: the `h1` at 62px with the header
ending at 50px.

`.ssg-shell .ssg-section` now carries the band padding, so it wins on specificity rather than on
import order. It is written from the same `space-5` token the shortcut uses, so the two cannot
drift, and the 12px gutter itself is untouched — a tinted hero still cancels exactly that with
`--ssg-page-gutter`.

The four templates whose root is `<q-page class="ssg-section">` — business, docs, landing's
`Page`, plain — all get the rhythm back. Only a landing hero was unaffected, because its root is
not a `q-page`.
