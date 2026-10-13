---
'@simple-site-generator/templates': patch
---

Make the brand header readable in dark mode.

Quasar matches the header with `.body--dark .q-layout__section--marginal` and
paints it `--q-on-surface` — the colour of the *page*, not of a primary bar. The
preflight that colours the header was equally specific, so the cascade decided
against it: measured **1.32:1**, near-white text on bright green, with the nav
links and the brand inheriting the same wrong colour.

The selector now carries the `body` element, which outranks Quasar's rule in both
modes without `!important`. Measured after the fix: header **7.67:1** in dark
mode, **6.49:1** in light.

The rest of dark mode was broken by a preset bug, not this template: QMarkdown's
dark block painted body text with `--q-surface-container-low` (a surface role),
so every heading, paragraph and list item resolved to the page colour —
**1.00:1**, invisible. That is fixed in `unocss-preset-quasar` (BUG-085) and
lands as 13.29:1 once the preset release carrying it is installed.
