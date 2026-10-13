---
'simple-site-generator': patch
'@simple-site-generator/templates': minor
---

Express the templates' styling as UnoCSS configuration, and measure the site the way a host serves it.

## `@simple-site-generator/templates`

- **The design system is UnoCSS configuration, not a stylesheet.** `tokens.css`
  is gone, along with every `<style scoped>` block in the shared components.
  `@simple-site-generator/templates/design` now exports the theme (the fluid
  type and spacing scale), the `ssg-*` shortcuts, the preflights for the rules a
  utility cannot express, and `ssgSafelist`.

  This is a bug fix, not a refactor for its own sake: Vite extracts the shared
  `tokens.css` into its own file, and the per-template entry CSS did not import
  it, so a consumer that followed the documentation — include
  `<package>/<template>/css` — got every `var(--ssg-*)` undefined and rendered
  **unstyled in both dev and the build**.

- The design uses **colour**: a dark brand bar for the header, a tinted title
  panel per page with a primary accent rule, white cards on a tinted page, and a
  dark footer. All of it reads `unocss-preset-quasar`'s MD3 role tokens
  (`--q-primary`, `--q-secondary-container`, `--q-surface-container*`,
  `--q-outline-variant`, `--q-elevation-level*`), so the app re-themes the whole
  template — including dark mode — from one source colour. The header background
  is set in a preflight because Quasar's own `q-header` rule wins the cascade for
  the element, so a utility cannot colour it.
- **The page's primary action is in the title band.** If a page declares `cta:`
  in frontmatter, the business, docs and landing page components render it as a
  button beside the title, so the hero has one obvious next step instead of the
  action being buried in the prose.

- **Imagery is supported**: markdown images and blockquotes in the prose are
  styled (full column width, rounded, brand-rule pull quotes) and get no
  layout shift.

- The class names are safelisted because the components are code-split into
  chunks (`assets/SiteHeader-*.js`) that the consumer's UnoCSS content scan does
  not match.

## `simple-site-generator`

- **`ssg verify` serves the build the way a real host does.** Its static server
  gzips compressible responses and sends `Cache-Control` (immutable for
  fingerprinted assets). Before this it served raw bytes with no cache headers,
  so Lighthouse measured uncompressed transfer and failed `cache-insight` for a
  site whose host would pass — the simsustech site's mobile performance score
  went **59 → 85** from the server change alone.
- The generated app template: wires the design system into `vitrify.unocss`,
  scans the whole templates package for classes, points the font preconnect at
  the provider the preset actually uses (`fonts.bunny.net`), and its Caddyfile
  caches fingerprinted assets immutably.
