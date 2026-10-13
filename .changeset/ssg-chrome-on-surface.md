---
'@simple-site-generator/templates': minor
---

Paint the layout chrome with surface and container roles, not the accent.

`primary` is an accent role: MD3 gives it tone 80 in dark mode, which is bright on
purpose because it is meant to fill a button or an icon on a dark surface. The
header and footer filled a full-width band with it, so in dark mode the site wore
a luminous green slab — and fixing the text contrast only made the slab legible,
not right.

The roles now match the job:

| | before | after | light | dark |
| --- | --- | --- | --- | --- |
| header | `primary` / `on-primary` | `surface-container-lowest` / `on-surface` | 17.2:1 | 14.9:1 |
| footer | `primary` / `on-primary` | `secondary-container` / `on-secondary-container` | 13.3:1 | 7.2:1 |

The brand colour has not gone anywhere: the title band, the buttons, links, icons
and the accent rule all still take `primary`, which is what it is for. Two side
effects worth knowing: the header no longer needs to out-specify Quasar's dark
`--q-on-surface` rule — the values now agree — and `on-primary` is no longer used
by the templates at all.
