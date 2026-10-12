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
- **A real `/404` route** is emitted, so `try_files … /404.html` in the generated
  Caddyfile has a file to serve.
