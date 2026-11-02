---
"@simple-site-generator/templates": patch
---

Make the header the height Quasar reserves for it.

At 1280 px and above the header measured 56 px while the prerendered page container reserved 50, so
the layout corrected the reservation on mount and everything below the header moved down 6 px, once.
Lighthouse reports it as CLS 0.0044 on a 1280 px viewport and 0.0000 below that — the shift never
shows up in a score, and a visitor sees the content settle.

The two numbers were both accidental. 50 px is Quasar's SSR default: with no browser to measure with,
`QLayout` writes the toolbar's own minimum into `padding-top`. 56 px is the header's tallest child —
the navigation is a `q-item`, and the MD3 one-line list container is 56 px. The nav-item shortcut
already asked for a 40 px row, and that request was inert: `min-h-[40px]` and the preset's `.q-item`
are both one class, so the preset's rule wins on emission order.

The preflight now restates the 40 px with two classes (`.ssg-header__nav .q-item`), which the preset
cannot out-rank. The header is 50 px at every width, exactly what the reservation says, so nothing is
corrected and nothing moves; below 1280 px the nav is hidden and nothing changes at all. Desktop nav
rows are 40 px rather than the accidental 56 — the height this design system asked for in the first
place — with the preset's 8 px item padding intact and no clipped labels.

`test/header-height.test.ts` pins the rule and the value it shares with the shortcut, because a header
one pixel taller than its reservation produces exactly this shift and no other gate looks at it.
