---
'simple-site-generator': patch
'@simple-site-generator/templates': patch
---

Make Quasar's own icons render, and give the language switch an icon.

**The generated app handed Quasar the icon-library *name*.** Quasar then resolved
its own font classes (`mdi mdi-menu-down`), and since no icon font is loaded,
every icon the framework draws itself — the dropdown arrow, a select's chevron, a
table's expander — rendered as nothing at all. The app template now passes the
rewritten icon set from `quasarIconSet()`, whose values are iconify classes the
preset already emits CSS for, asserted to Quasar's type at that one boundary.

The resolution's `iconMapFn` is deliberately not passed: Vitrify serialises the
Quasar config into the client bundle and a function does not survive the trip —
passing it made the arrow throw `toClass is not defined`. Bare icon names need
that mapper, so write `i-mdi-*` names.

**The language switch in the header is now labelled with an icon** (`i-mdi-translate`)
as well as the language name, matching how the same choice appears in the
overflow menu.
