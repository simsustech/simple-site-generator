# CONTEXT — simple-site-generator

## What this is

A kit an AI agent uses to roll out a **complete, working, fast website**: a scaffold, a page/SEO
contract, and a verifier that refuses to accept a broken or slow result.

Three packages:

| package                            | role                                                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `simple-site-generator`            | the kit: the `ssg` CLI, the app template, and the agent instructions (`AGENTS.md`, `CONTENT-BLUEPRINT.md`) |
| `@simple-site-generator/templates` | the three template modules and the shared layer they are built from                                        |
| `create-simple-site-generator`     | **retired** — replaced by `ssg init`                                                                       |

## How a site is produced

```text
ssg init ──▶ generated project ──▶ ssg add-page ──▶ ssg check ──▶ ssg build ──▶ ssg verify
             (templates/app)       (frontmatter)     (contract)    (vitrify SSG)  (SEO+bytes+Lighthouse)
```

`ssg build` is a thin wrapper over `vitrify build -m ssg`. The build belongs to vitrify; duplicating it
would fork the pipeline from the one the dev server uses.

## Runtime shape

The generated app is **Vitrify + Quasar + UnoCSS (`unocss-preset-quasar`)**, prerendered to static HTML.

- `src/pages/**` — Markdown with frontmatter. The single source of truth for the site's content.
- `src/router/routes.ts` — builds the route table from that frontmatter. Every route carries a `meta`
  record (id, title, description, noindex) which is the _one_ description of a page; the shell reads it
  for `<head>` tags and the build reads it for the sitemap.
- Two virtual modules: `virtual:ssg:template` (the template module's components) and `virtual:ssg:site`
  (site identity only — deliberately **not** the whole build config, which used to ship 109 KB to every
  visitor).
- `src/seo/sitemap-plugin.ts` in the templates package writes `sitemap.xml` and `robots.txt` at build
  time from the same frontmatter.

## The shared layer

`packages/templates/src/shared/` holds `SiteShell`, `SiteHeader`, `SiteFooter`, `Hero`, `CtaButton`,
`ProofSection`, `BentoGrid`, `FaqList`, `Breadcrumbs`, `PageContent`, `StickyCta` and the
pure `nav.ts` / `headings.ts` helpers.

The three template modules (`docs`, `landing`, `business`) are thin compositions over it. Before this
was consolidated there were five near-identical layouts, and every fix had to be applied five times and
drifted. See `docs/adr/0002-shared-template-layer.md`.

Styling is **UnoCSS configuration, not a stylesheet**: `src/design.ts` exports the type/spacing
scale (as theme entries), the `ssg-*` shortcuts, the short list of preflights, the safelist of the
design system's class names, and a blocklist for candidates the scanner reads out of tag names. The
generated app merges it into `vitrify.unocss` beside `unocss-preset-quasar`, and every component class
in the markup resolves from there. There is no CSS file to load, and no CSS export at all — see
`docs/adr/0003-design-system-as-config.md` for why, and for what that costs (a class that fails to
emit is silent everywhere else in the toolchain).

## Where the `<head>` comes from

`SiteShell` calls `useSeo(page, site, path)`, which builds Quasar `Meta` options from the current page's
frontmatter and the site config.

It is built in the **layout**, not in page components. The layout is the only component guaranteed to be
in Vue Router's active chain on every route; a page marked `noSsr` is wrapped in `QNoSsr` and a
lazily-resolved page component is not collected during prerender, so component-level meta silently emits
nothing for exactly those pages. See `docs/adr/0001-seo-meta-production-point.md`.

## Verification

`ssg verify` has two tiers, deliberately — see `docs/adr/0004-verify-two-tiers.md`:

- **Hard failures** — everything deterministic: the SEO surface of each built page (exactly one
  `<title>`, one absolute canonical on the configured origin, a description, parseable JSON-LD, one
  `<h1>`, `lang` on `<html>`), gzipped byte budgets (JS ≤ 250 KB, CSS ≤ 60 KB) measured from the build
  output, and **markup ↔ stylesheet coverage** — every `ssg-*` class a page uses must be styled by the
  built CSS or be listed as a by-design hook. That last one exists because a class the design system
  lost produces no CSS and no error anywhere else (ADR-0003).
- **Warnings** — Lighthouse performance, which varies with the measuring machine, and a notice when a
  budget is within 10% of its ceiling. A gate that fails
  randomly gets switched off, so only the deterministic half blocks.

Byte budgets are measured **from disk**, not from Lighthouse: its `resource-summary` audit reports zero
when the trace captures no network activity, and a budget that measures nothing is a gate that cannot
fail. Accessibility, best-practices and SEO scores must be 100.

## Known constraints

- Quasar's runtime dominates the JavaScript budget. The reference site (`business`) measures
  192.6 KB gzipped of the 250 KB ceiling — 77%, which leaves a real but not large margin. The
  figure once quoted here for the docs template (~248 KB of 250 KB) predates removing the client
  markdown parser and should be re-measured before it is used to justify anything. See
  `docs/known-issues.md` KI-1.
- Any large dependency is hard to move off the eager path: vitrify's built-in `vendor` chunk group
  matches all of `node_modules` and wins over an app-defined group, so `vitrify.chunks` has no effect
  on the client bundle. This is what made the markdown parser unavoidable while it was client-side.
  It is a vitrify-side defect and the app-level workaround would fork the build pipeline from the one
  the dev server uses. See `docs/known-issues.md` KI-2.
- Nothing type-checks `packages/simple-site-generator/templates/app/`: it has no `node_modules` and is
  in no `tsconfig` include, because it is rendered into a project that installs its own dependencies.
  A syntax or logic error in it is invisible to `tsc`, `oxlint` and the test suite, and surfaces only
  when a generated site is built. See `docs/known-issues.md` KI-3.
- VitePress was evaluated for the docs template and rejected as a wholesale replacement (it would discard
  the shared Quasar layer and duplicate the build/verify loop). It remains an option as a separate
  default-theme build served under `/docs/`.
