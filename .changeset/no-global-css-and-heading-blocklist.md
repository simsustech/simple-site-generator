---
'simple-site-generator': minor
'@simple-site-generator/templates': minor
---

Stop shipping the UnoCSS scanner's leavings, and block the heading-tag landmine.

Three things, all one problem: the scanner reads candidates out of *text*, not
just out of class attributes.

**`globalCss` is gone.** The app config imported
`@simple-site-generator/templates/<template>/css`, which resolved to the templates
package's own build output. That output was produced by a bare `presetUno()` run
over the package's source, so it contained `.outline{outline-style:solid}`,
`.grid{display:grid}`, `.visible{visibility:visible}` and the heading utilities
below — and nothing else. The UnoCSS plugin is removed from the templates build
and the package no longer has a CSS export; it ships components and a design
system configuration, and the app owns the CSS.

**`h1`–`h6` are blocklisted in the design system.** UnoCSS extracts `h1` from
`<h1>` exactly as it does from `class="h1"`, and `presetUno` answers it because
the bare `hN` form is a height shorthand. Every site that rendered an `<h1>` was
therefore shipping `.h1{height:.25rem}` — `.h2{height:.5rem}` from `<h2>`, and so
on. The bytes are nothing; the collision is the problem. `h1` is a plausible
class name (a CMS, a pasted block, a design system that names its heading levels
that way), and such an element would silently collapse to 4px tall with nothing
in the source to explain it. `h-1` still works, so the blocklist costs nothing.
`blocklist` is exported as part of `ssgUnoConfig`, so every site inherits it.

**The templates package stays in the content scan.** This was the tempting
"fix" and it is wrong. Removing the `@simple-site-generator/templates/**/*.js`
include looks like a free ~17 KB of CSS per site, and measuring it against the
site's own sources showed **137 selectors that exist only because of it** —
`q-separator`, `q-card__actions--*`, `q-btn-group*`, `i-mdi-phone`. A template
component renders Quasar components and icon classes as readily as it renders an
`ssg-*` class, and the preset is what turns those into CSS. The include is now
commented to say so, `tests/cli` pins it, and the noise that rides along with it
is bounded by the blocklist instead.
