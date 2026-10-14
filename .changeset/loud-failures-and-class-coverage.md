---
'simple-site-generator': minor
'@simple-site-generator/templates': minor
---

A loud failure for an unknown `page:`, and a gate for markup that nothing styles.

Both changes exist for the same reason, which the kit keeps meeting: **a defect
that renders plausibly instead of failing.**

**An unknown `page:` now fails the build.** The router used to fall back to the
template module's `Page` when the named component did not exist:

```ts
componentName && templates[componentName] ? templates[componentName] : module.Page
```

That is the worst possible outcome for a field that decides a page's whole layout.
The page renders, looks plausible, and is the wrong template — and it is exactly
how the retired names behave (`small-business`, `small-business-v2`, `personal`,
`one-page`, `documentation`), which is the situation every site on `0.1.x` is in.
It now throws during prerender, naming the page, the value, and the components the
configured template module actually provides. No list of retired names is kept:
deprecated names in the source are their own kind of debt, and the error is
actionable without them.

**`ssg verify` now checks that markup and stylesheet agree.** Every `ssg-*` class
a built page uses must be styled by the built CSS, or appear in an explicit list of
by-design hooks. This is the gate the design system has been missing: a class whose
shortcut failed to emit produces no CSS and no error anywhere else in the
toolchain, because TypeScript and the linter both see a string and the build
succeeds. It was found by a shortcut array losing its separating comma, which
parses as a computed member access, silently drops the *next* entry, and left
`tsc`, `oxlint` and 151 tests green while `ssg-business__band-demo` rendered
unstyled. That happened twice in one afternoon and was caught both times only by
looking at the page.

**A near-budget warning.** `ssg verify` now warns when measured bytes come within
10% of a ceiling. A budget a site is always near is a cliff; this makes "no
headroom" visible on every run rather than only at the moment it fails. The
reference site measures 192.6 KB of 250 KB, which does not trip it.

**Also:** the docs no longer carry a stale constraint. `CONTEXT.md` claimed the
docs template measured ~248 KB of 250 KB and attributed the `vendor` chunk to
`markdown-it`, which stopped being true when the client markdown parser was
removed; that figure must be re-measured before anyone leans on it. Known
constraints now live in `docs/known-issues.md` with what was measured and what a
fix would require, and the two load-bearing decisions behind this release are
recorded as ADR-0003 (the design system is configuration, not a stylesheet) and
ADR-0004 (verification is two tiers).

**For consumers on `0.1.x`:** the styling model changed — a site must merge
`ssgUnoConfig` into `vitrify.unocss` or it renders unstyled — and four template
names were retired. `MIGRATING.md` is new and covers the whole move. This is a
`minor` rather than a `major` on purpose: it is pre-1.0, and a `0.2.0` is enough
to stop a `^0.1.x` range from picking it up by accident, which is what matters.
