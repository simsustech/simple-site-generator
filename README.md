# simple-site-generator

Tools and instructions for an AI agent to roll out a **complete, working, beautiful and fast website**.

You describe the site; the kit scaffolds it, enforces a page contract, prerenders it to static HTML, and
then refuses to accept the result unless it is actually correct and fast.

- **[Quick start](#quick-start)** · **[Commands](#the-ssg-commands)** · **[What verify checks](#what-ssg-verify-checks)**
- **[The page contract](#the-page-contract)** · **[Styling](#styling-the-design-system)** · **[What the scaffold gives you](#what-the-scaffold-gives-you)**
- **[Docs map](#docs-map)** · **[Known issues](#known-issues)** · **[Migrating an older site](MIGRATING.md)**

---

## Quick start

```bash
pnpm dlx simple-site-generator init my-site --template landing \
  --site-name "Acme Plumbing" --url https://acme.com
cd my-site
pnpm install

pnpm check      # validate every page against the contract
pnpm build      # prerender to dist/static
pnpm verify     # SEO surface, byte budgets, markup↔stylesheet, Lighthouse
pnpm preview    # serve the build the way production does → :8095
```

Four templates: `docs`, `landing` (conversion-oriented single page), `business` (multi-page local
business), `plain` (one service, one action, the price on screen first).

---

## The four templates

A "template" is a **module** in `@simple-site-generator/templates`, chosen once per site in
`vitrify.config.ts`. It supplies the layout, the default page component, and optionally a special
landing page.

| module     | for                                                         | exports                     | a page may say   |
| ---------- | ----------------------------------------------------------- | --------------------------- | ---------------- |
| `business` | multi-page local business: services, opening hours, contact | `Layout`, `Page`            | _(omit `page:`)_ |
| `landing`  | one conversion page plus support pages                      | `Layout`, `Page`, `Landing` | `page: Landing`  |
| `plain`    | one service, one action, a price card and a quote form      | `Layout`, `Page`            | _(omit `page:`)_ |
| `docs`     | documentation                                               | `Layout`, `Page`            | _(omit `page:`)_ |

All four are thin compositions over one shared layer (ADR-0002). The shared components are
`SiteShell`, `SiteHeader`, `SiteFooter`, `SkipLink`, `CtaButton`, `Hero`, `HeroDemo`, `PrincipleGrid`,
`ProofStrip`, `BentoGrid`, `ProofSection`, `FaqList`, `Breadcrumbs`, `PageContent`, `StickyCta`.

**Switching templates** — the value lives in `vitrify.config.ts`:

```ts
const ssg = {
  template: 'business',
  templatePackage: '@simple-site-generator/templates' /* … */
}
```

Two things must move with it, and both fail loudly now if they do not:

1. **`page:` frontmatter.** `page: Landing` resolves only in the `landing` module. Naming a component
   that does not exist throws during prerender, naming the page, the value, and what the module
   actually provides. _(It used to fall back to `Page` silently — a wrong-looking-right home page. This
   is also why the scaffold's `page: Landing` is now emitted only for the `landing` template.)_
2. **The `Layout`/`Page` swap is automatic** — both come from `virtual:ssg:template`, so nothing in
   `src/` imports a template component directly.

There is deliberately **no list of retired template names** in the code. `small-business`,
`small-business-v2`, `personal`, `one-page` and `documentation` existed in the old five-template era; a
site naming one gets the loud failure and `MIGRATING.md`.

---

## How a site is produced

```text
ssg init ──▶ generated project ──▶ ssg add-page ──▶ ssg check ──▶ ssg build ──▶ ssg verify
             (templates/app)       (frontmatter)     (contract)    (vitrify SSG)  (SEO+bytes+coverage+Lighthouse)
```

`ssg build` is a thin wrapper over `vitrify build -m ssg`. The build belongs to vitrify; duplicating it
would fork the pipeline from the one the dev server uses.

---

## The `ssg` commands

| command             | what it does                                                   | flags                                                                                                    |
| ------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `ssg init [dir]`    | scaffold a project from `templates/app`                        | `--template <docs\|landing\|business>` (default `docs`), `--site-name <name>`, `--url <origin>`, `--yes` |
| `ssg add-page <id>` | create a page with valid frontmatter                           | `--title`, `--description`, `--tags <a,b>`, `--page <Component>`                                         |
| `ssg check`         | validate every page against the contract                       | —                                                                                                        |
| `ssg build`         | `vitrify build -m ssg` → `dist/static`                         | —                                                                                                        |
| `ssg verify`        | assert the built site; exits non-zero if it is not good enough | `--no-lighthouse`, `--ignore <glob>` (repeatable), `--js-budget <kb>`, `--css-budget <kb>`               |

Every command prints a machine-readable result on failure and exits non-zero. `ssg init` never prompts
when `--yes` is passed or stdin is not a TTY, so an agent can drive it.

`--ignore "google*.html"` is the common case for a site-verification drop-in: those files are not pages
and have no title, canonical or `<h1>`, so they cannot satisfy the SEO surface.

### Local preview

```bash
pnpm preview                      # build, then serve → http://localhost:8095
PREVIEW_PORT=9000 pnpm preview    # …on another port
```

The scaffold ships `build/Caddyfile.preview`, whose shape mirrors the production `build/Caddyfile`:
`try_files {path}.html {path}` so extensionless routes resolve, and a handler that answers a real
**404** with the site's own error page. `caddy file-server` was rejected because it has no `try_files`
and answers 404 for every page URL.

---

## What `ssg verify` checks

Two tiers, deliberately. **Only the deterministic half blocks** (ADR-0004).

### Hard failures

| check                            | detail                                                                                                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SEO surface**, per page        | exactly one `<title>`; exactly one canonical, absolute, on the configured origin; a description; parseable JSON-LD; exactly one `<h1>`; `lang` on `<html>` |
| **Byte budgets**                 | JS ≤ **250 KB**, CSS ≤ **60 KB**, gzipped, **measured from the built files on disk**                                                                       |
| **Markup ↔ stylesheet coverage** | every `ssg-*` class a page uses must be styled by the built CSS, or be listed as a by-design hook                                                          |

Some details are load-bearing:

- Budgets are measured **from disk, not Lighthouse**: its `resource-summary` audit reports
  `transferSize: 0` when the trace captures no network activity, and a budget that measures nothing is
  a gate that cannot fail. An all-zero measurement is reported as a **failure**, not a pass.
- Scores that are defects rather than trade-offs must be exactly **100**: accessibility,
  best-practices, SEO.
- The coverage check exists because a class whose shortcut failed to emit produces no CSS and **no error
  anywhere else** — TypeScript and the linter both see a string and the build succeeds. Only `ssg-*`
  classes are checked; Quasar adds state classes at runtime that are legitimately absent from the
  prerendered sheet. The by-design hooks are listed in
  `packages/simple-site-generator/src/verify/class-coverage.ts`.

### Warnings

| check                      | detail                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Lighthouse performance** | threshold, not equality — it varies with the measuring machine                                                                 |
| **Near-budget**            | fires when measured bytes are within 10% of a ceiling, so "no headroom" is visible on every run rather than only when it fails |

Lighthouse needs Chromium: set `CHROME_PATH`, or pass `--no-lighthouse` to run the whole deterministic
half in seconds with no browser.

---

## The page contract

Every page is Markdown with frontmatter. `ssg check` validates it before a build, so a typo fails in the
terminal instead of in production.

| field                                | required | what it drives                                                       |
| ------------------------------------ | -------- | -------------------------------------------------------------------- |
| `id`                                 | yes      | the route. Unique; `home` is the root and is always first in the nav |
| `title`                              | yes      | the `<h1>` and the document title                                    |
| `headTitle`                          | no       | the document title verbatim, without the site-name suffix            |
| `description`                        | yes      | the meta description. A page without one is invisible to search      |
| `label`                              | no       | navigation label; falls back to `title`                              |
| `order`                              | no       | sort weight in navigation                                            |
| `tags`                               | no       | `menu`, `footer`, `contact` — which nav surface the page appears in  |
| `noindex`                            | no       | excluded from the sitemap and marked `noindex`                       |
| `noSsr`                              | no       | render client-side only                                              |
| `page`                               | no       | template component to render. Must exist in the configured module    |
| `image`                              | no       | social-card image                                                    |
| `headerImage`                        | no       | illustration behind the page's title band                            |
| `breadcrumbs`                        | no       | trail, outermost first; also emits `BreadcrumbList`                  |
| `faq`                                | no       | question/answer pairs, mirrored into `FAQPage` structured data       |
| `cta`                                | no       | the page's single primary action                                     |
| `demo`                               | no       | hero process graphic: `{ steps: string[], label? }` — see below      |
| `principles`                         | no       | numbered card band: `{ heading?, leading?, items, note? }`           |
| `subpages`                           | no       | ids nested under this one in a navigation dropdown                   |
| `cards`, `lists`, `images`, `videos` | no       | structured content the template renders                              |
| `extra`                              | no       | site-level business details (phone, reviews, service area)           |
| `icon`, `lang`, `alternates`         | no       | nav icon; per-page language and hreflang cluster                     |

Two fields are worth singling out, because they replaced illustrations:

```yaml
demo: # an animated, token-themed process graphic
  label: How we work, from first email to handover
  steps: [Conversation, Fixed quote, Built in phases, Handover]

principles: # numbered cards, real text
  heading: Simple, sustainable technology
  leading: Four rules, applied before choosing anything.
  items:
    - title: Simple by default
      text: The smallest stack that solves the problem.
  note: Each rule removes work later.
```

**The card band's heading is a label, not content.** Both card bands (the business template's
`Services` and the landing template's) take it from `extra.cardsHeading`, so a site that does not want
the English word sets it rather than adding a field to every page that shows cards. It is a site-wide
bag, so a multilingual site passes the right word per page from its route table.

**A bilingual site's navigation follows the page, not the default language.** `tags` decides which
nav surface a page appears in; `lang` decides whose. The menu, contact and footer resolution match
each page's `lang` against the language of the page being viewed, so `/nl` gets the Dutch menu rather
than the default language's — which is what a site with `nl/` pages otherwise shipped, and it meant a
Dutch visitor's only route onward was the language switch. A page that declares no `lang` is neutral
and stays in every menu, so a single-language site keeps exactly the menu it had.

**The trap worth knowing:** a field missing from `SitePage` in
`packages/templates/src/shared/types.ts` is **never exposed as a Vue prop**. Vue derives runtime props
from the type, so the frontmatter value lands in `attrs` and the component renders without it —
silently. The type's own comments say this on `cta` and `headerImage`. Add the field to the type and,
if it should be validated, to `pageFrontmatterSchema` in
`packages/simple-site-generator/src/pages/page-schema.ts`.

---

## Where the `<head>` comes from

`src/pages/**` is the single source of truth. `src/router/routes.ts` builds the route table from that
frontmatter, and every route carries a `meta` record — the _one_ description of a page. The shell reads
it for `<head>` tags; the build reads it for the sitemap. There is no second place a title lives.

- **The head is produced in the layout**, by `SiteShell` via `useSeo(page, site, path)` — not in page
  components. A page marked `noSsr` or resolved lazily is not in the prerender's active chain, so
  component-level meta emits nothing for exactly those pages, silently (ADR-0001).
- **Two virtual modules.** `virtual:ssg:template` (the template module's components) and
  `virtual:ssg:site` (site identity only). The second exists because importing the whole build config
  instead inlined the entire UnoCSS/Quasar option tree into the browser bundle — 109 KB minified.
- **`sitemap.xml` and `robots.txt`** are written at build time by the `ssgSitemap` plugin, from the same
  frontmatter.
- **The 404 route is a child of the layout**, so it renders inside the shell and gets head tags. As a
  sibling it had no header, no footer and no meta at all.
- **One rule, two title fields.** `title` names the page: it is the `<h1>` and, with the site name
  in front of it, the document title. `headTitle` replaces the document title outright, suffix and
  all, for the page whose heading is a sentence but whose title in a tab is the site — the front
  page. `og:title` and `twitter:title` follow whichever is set, so no page states two different
  names for itself.

---

## Styling: the design system

There is **no stylesheet**. The design system _is_ an exported UnoCSS configuration, merged into
`vitrify.unocss` beside `unocss-preset-quasar` (ADR-0003):

```ts
import { ssgUnoConfig } from '@simple-site-generator/templates/design'

vitrify: {
  unocss: {
    presets: [QuasarPreset({ /* … */ })],
    ...ssgUnoConfig,                                  // theme, shortcuts, preflights, safelist, blocklist
    theme: { ...ssgUnoConfig.theme, colors: ssg.colors },
    content: { pipeline: { include: [
      /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
      new RegExp(`${ssg.templatePackage}.*\\.js`)      // NOT optional — see below
    ] } }
  }
}
```

| export          | what it is                                                                                                                         |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `ssgTheme`      | the type and spacing scale as theme entries → `text-step-3`, `py-space-5`                                                          |
| `ssgShortcuts`  | the recurring compositions, so markup keeps readable `ssg-*` names                                                                 |
| `ssgPreflights` | the rules no utility can express: element scopes, `:focus`, media queries, keyframes                                               |
| `ssgSafelist`   | every shortcut name, so it survives Vite's chunk splitting                                                                         |
| `blocklist`     | candidates the scanner reads out of _markup_: `h1`–`h6` from `<h1>` tag names, which would otherwise emit `.h1 { height: .25rem }` |

Colour comes from the preset's MD3 role tokens (`--q-primary`, `--q-surface-container*`,
`--q-outline-variant`), so one `sourceColor` themes everything including dark mode, which switches with
`body--dark`. **Nothing here hardcodes a hex.**

**The scan of `@simple-site-generator/templates/**/*.js` is required.** It looks removable — it accounts
for ~17 KB of CSS — but measuring it against a site's own sources showed **137 selectors that exist only
because of it**: the Quasar component classes (`q-separator`, `q-card__actions--*`) and icon classes
(`i-mdi-phone`) that template components render. Removing it is an unstyled drawer and missing icons.

### The failure mode, and the guards around it

Class names are an interface here, and a class that fails to emit is silent everywhere else. Four
distinct ways this has bitten, all in `packages/templates/src/design.ts`:

| mistake                               | what happens                                                             | guarded by                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| a shortcut loses its separating comma | `][` parses as computed member access; the entry **after** it vanishes   | `test/design-system.test.ts` asserts the table's shape                            |
| a stray backtick inside a preflight   | ends the template literal; the build fails pointing at an unrelated line | `test/preflight-css-literals.test.ts` names the real line                         |
| two classes both set `display`        | resolved by stylesheet order, not intent                                 | `test/design-system.test.ts` asserts a base class leaves `display` to its variant |
| a shortcut that never emits           | class in markup, nothing in CSS, no error anywhere                       | **`ssg verify` markup ↔ stylesheet coverage**                                     |

---

## What the scaffold gives you

`ssg init` renders `packages/simple-site-generator/templates/app/` into the target directory. Three files
are templated (`.hbs`): `vitrify.config.ts`, `build/Caddyfile`, and
`.github/workflows/deploy-rsync.yaml`; `src/pages/Index.md.hbs` is the fourth, because its `page:` line
depends on the template.

```text
vitrify.config.ts        site identity, colours, the template, Caddyfile copy
build/Caddyfile          production: real 404, immutable hashed assets
build/Caddyfile.preview  `pnpm preview`
index.html               document shell
src/pages/               Markdown: Index (home), Contact, GettingStarted
src/pages/Error404Page.vue
src/router/routes.ts     the route table, built from frontmatter
src/setup.ts             app bootstrap
public/                  favicons, robots.txt, a starter image
.oxlintrc.json .oxfmtrc.json
```

Generated scripts: `dev`, `dev:ssr`, `build`, `build:csr`, `build:ssr`, `build:ssg`, `check`,
`preview`, `verify`, `test`, `lint`, `lint:fix`, `format:check`, `format:write`.

Generated dependencies are deliberately minimal. Runtime: `quasar`, `vue`, `vue-router`, `@quasar/extras`,
`@quasar/quasar-ui-qmediaplayer`, `@simple-site-generator/templates`, `unocss-preset-quasar`,
`vite-plugin-pwa`, `@fastify/{middie,static}`. Tooling: `vitrify`, `vite`, `typescript`, `unocss`,
`oxlint`, `oxfmt`, `fastify`, `devcert`, `beasties`, `gray-matter`, `vite-plugin-markdown`,
`icon-gen`, `npm-run-all`, `workbox-window` and the `@unocss`/`@vue` packages Vite needs.

Two absences are deliberate: **`@quasar/quasar-ui-qmarkdown`** (Markdown is rendered at build time by
`vite-plugin-markdown` and injected as HTML, so no parser ships to the client) and **a local layout**
(see below).

**The scaffold does not contain a layout.** `Layout` comes from the template module through
`virtual:ssg:template`; a local `MainLayout.vue` would be dead code, and the one that used to be
scaffolded (the "Quasar App / Essential Links" starter) was removed for exactly that reason.

---

## Packages

| package                                                   | role                                                                                               |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [`simple-site-generator`](packages/simple-site-generator) | the kit: the `ssg` CLI, the app template, and the agent docs (`AGENTS.md`, `CONTENT-BLUEPRINT.md`) |
| [`@simple-site-generator/templates`](packages/templates)  | the three template modules, the shared layer, the design system, and the SEO builders              |

Published subpaths of the templates package — the entry keys are the subpaths and deliberately do not
match file names:

| subpath                             | built from             | why separate                                                                                                                                         |
| ----------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.`                                 | `src/index.ts`         | shared components and types for app code                                                                                                             |
| `./business`, `./landing`, `./docs` | `src/<name>/<name>.ts` | the template modules                                                                                                                                 |
| `./design`                          | `src/design.ts`        | build-time UnoCSS config; the root deliberately does not re-export it, so an app's runtime import cannot pull the option tree into the client bundle |
| `./seo`                             | `src/seo/build.ts`     | loaded by Node build tooling, so it must stay free of `.vue` and Quasar imports                                                                      |

`create-simple-site-generator` is **retired** — use `ssg init`.

---

## Docs map

| document                                                                      | what it is for                                                                                               |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `README.md`                                                                   | this file: how everything works                                                                              |
| [`CONTEXT.md`](CONTEXT.md)                                                    | the architecture, the runtime shape, where the head comes from                                               |
| [`AGENTS.md`](packages/simple-site-generator/AGENTS.md)                       | the contract an agent follows: page schema, SEO rules, conversion rules, anti-patterns                       |
| [`CONTENT-BLUEPRINT.md`](packages/simple-site-generator/CONTENT-BLUEPRINT.md) | what to write: service × location matrix, internal linking, E-E-A-T, answer-first structure                  |
| [`docs/adr/`](docs/adr/)                                                      | the four load-bearing decisions: head in the layout, one shared layer, design system as config, verify tiers |
| [`docs/known-issues.md`](docs/known-issues.md)                                | what is broken or constrained, what was measured, what a fix needs                                           |
| [`MIGRATING.md`](MIGRATING.md)                                                | moving a site from the published `0.1.x` line onto the current kit                                           |

---

## Known issues

Real, understood, not fixed here. Full detail in [`docs/known-issues.md`](docs/known-issues.md).

- **KI-1 — the JS budget has little headroom.** The reference site measures 192.6 KB of 250 KB (77%).
  A stale figure for the docs template is quoted nowhere on purpose; re-measure before relying on it.
- **KI-2 — `vitrify.chunks` cannot move a large dependency off the eager path.** Vitrify's built-in
  `vendor` chunk group wins over an app-defined one. Latent since the client markdown parser was removed;
  it will bite the next large dependency. A fix belongs in vitrify.
- **KI-3 — nothing type-checks `templates/app/`.** It has no `node_modules` and is in no `tsconfig`
  include. An edit there can delete a function's opening line and pass `tsc`, `oxlint` and the whole
  test suite; it surfaces only when a generated site is built.

---

## Development

```bash
pnpm install
pnpm run build        # templates, then the CLI
pnpm test             # unit + component tests (vitest)
pnpm run test:cli     # the ssg CLI, exercised as a subprocess
pnpm run typecheck
pnpm run lint
pnpm run format:check
```

`pnpm run build` matters when consuming the kit from a site: pnpm **copies** `file:` dependencies, so
editing the kit changes nothing in a site until the copy is refreshed with
`pnpm install --force`. A kit fix that "does nothing" is almost always this.

Other suites:

```bash
pnpm run test:lighthouse                            # byte-budget units
SSG_E2E_URL=http://127.0.0.1:4173 pnpm run test:e2e # Playwright against a served build
pnpm exec changeset                                 # every consumer-visible change needs one
```

Commit messages follow conventional commits with a scope (`feat(templates): …`, `fix(website): …`),
enforced by a `commit-msg` hook. The pre-commit hook runs `lint` and `format:check`.

## License

MIT
