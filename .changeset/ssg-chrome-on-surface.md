---
'@simple-site-generator/templates': minor
---

Give the layout chrome a brand tint instead of the accent colour.

`primary` is an accent role: MD3 sets it to tone 80 in dark mode, which is bright
on purpose, because it is meant to fill a button or an icon on a dark surface.
The header and footer filled a full-width band with it, so in dark mode the site
wore a luminous green slab — and fixing the text contrast only made that slab
legible, not right.

The chrome now wears a light tint of the same hue, and the accent stays where it
belongs:

| | role | light | dark | contrast |
| --- | --- | --- | --- | --- |
| header | `secondary-container` / `on-secondary-container` | `#d6e8cd` | `#3c4b37` | 13.3:1 / 7.2:1 |
| footer | `secondary-container` / `on-secondary-container` | `#d6e8cd` | `#3c4b37` | 13.3:1 / 7.2:1 |
| title band | `surface-container-high` / `on-surface` | `#e8e9e2` | `#282b27` | 14.0:1 / 11.1:1 |
| buttons, links, icons, band rule | `primary` / `on-primary` | `#006e0c` | `#46e343` | 6.5:1 / 7.7:1 |

`secondary-container` rather than `primary-container` on purpose: the latter is
`#75ff68`, brighter than the accent it derives from and too loud for a bar that
appears on every page. The title band moved off the tint and onto a neutral
surface — a band in the same tone as the header directly above it reads as one
block, and the band keeps the brand rule down its side.

A side effect worth knowing: the header preflight no longer has to out-specify
Quasar's dark `--q-on-surface` rule to be legible, and `on-primary` is no longer
referenced by the templates at all.
