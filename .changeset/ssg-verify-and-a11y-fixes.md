---
'simple-site-generator': patch
'@simple-site-generator/templates': patch
---

Fix the verifier, the generated app's head and the drawer's list semantics.

All of these were found by building a real site (the simsustech website) with the
kit; `ssg verify` reported two of them and the other three were caught while
making it pass.

## `simple-site-generator`

- **The `ssg` binary is exported again.** `AGENTS.md`, the generated
  `package.json` scripts and the usage text all call `ssg`, but the package only
  shipped a `simple-site-generator` bin, so `pnpm check` / `pnpm verify` in a
  scaffolded project failed with "command not found".
- **`verify --ignore <glob>`** leaves files out of the SEO surface check. A
  third-party drop-in that ends in `.html` (a Google site-verification file, for
  example) is not a page and cannot carry a title, canonical or JSON-LD.
- **`verify` names the failing audits**, with the selector of the nodes behind
  each one. A bare "accessibility score is 95" was not actionable; now the same
  line adds `aria-required-children [aside.q-drawer > … > div.q-list]`.
- **The SEO surface ignores HTML comments.** The app template's own comments
  mention `<h1>`, and counting those made a page that renders exactly one heading
  report "3 `<h1>` tags" — a false failure that hid whether the check worked.
- **`chrome-launcher` and `lighthouse` are runtime dependencies.** They were
  `devDependencies`, so a project consuming the package got a `verify` that
  crashed on `Cannot find package 'chrome-launcher'`.

## `@simple-site-generator/templates`

- **The layout reads the current page from `route.meta`.** It only consulted the
  page list, so a route that is not a page — the `404` — was rendered with
  `index, follow` even though its route meta says `noindex`, and its title and
  description were dropped.
- **The mobile drawer's navigation is a real list.** A `q-list` renders
  `role="list"` and a clickable `q-item` renders an `<a>`, which is not a
  `listitem`, so Lighthouse's `aria-required-children` audit failed the drawer.
  The anchor now sits inside a `role="listitem"` item, which keeps the link role.

## Generated app template

- **`index.html` no longer contains tag literals in its comments.** Vitrify
  rewrites the head with tag-matching regular expressions, and the literal
  `<title>` in the old comment was matched by the title replacement — which
  mangled the document and left every injected meta tag *inside a comment*. The
  tags were in the HTML but not in the document.
- **The `404` view is a `main` landmark**, so a document still has exactly one
  when the page does not render `q-page`.

## Also

- **Type declarations are shipped.** `@simple-site-generator/templates` now has
  a hand-written `types/` surface (the shared data contracts in full; components
  typed as Vue's `Component`, since the TypeScript 7 native port has no
  declaration build) and emits the declarations next to the built JavaScript, so
  both `exports.types` resolution and a plain sibling `.d.ts` lookup succeed.
  Consumers no longer need a local `declare module` shim.
- **One `<main>` landmark.** `SiteShell` wrapped the page in a `<main>`, and the
  page's `q-page` is also a `<main>`, so every real page had two. The shell now
  renders the skip-link target as a plain `div` and the page's `q-page` is the
  single landmark.
- **`ssg.lang` now reaches `<html lang>`.** Quasar writes `<html lang>` from the
  pack it loads, which previously always came out `en-US`; the template passes
  `ssg.lang` through `vitrify.lang` so `<html lang>`, `og:locale` and the
  JSON-LD `inLanguage` agree. `ssg.lang` must therefore be a Quasar pack id
  (`en-US`, `en-GB`, `nl`, …) — documented in `AGENTS.md`.
- **Unit tests for the verifier.** `checkSeoSurface` (comment handling, all-faults
  reporting) and the `--ignore` filter now have regression tests.

