# simple-site-generator — agent instructions

You are generating a **complete, working, fast website**. This package is the kit: a template, a
page/SEO contract, and a verifier that refuses to accept a broken or slow result.

Everything below is the contract. Follow it rather than inventing structure — the templates, the
verifier and the generated `<head>` all assume it.

## The loop

```bash
ssg init my-site --template landing --site-name "Acme Plumbing" --url https://acme.com
cd my-site && pnpm install
ssg add-page services --title "Services" --tags menu
ssg check          # validate frontmatter before building
ssg build          # prerender to dist/static
ssg verify         # SEO surface + byte budgets + Lighthouse
```

`init` is non-interactive with `--yes` (it never prompts when stdin is not a TTY). Templates:
`docs`, `landing`, `business`.

**Do not deploy until `ssg verify` exits 0.** It is the only thing standing between "the agent says
it built a site" and "the site is actually correct and fast".

## The page contract

Pages are Markdown in `src/pages/**` with YAML frontmatter. `ssg check` enforces this schema:

| field                                | required | notes                                                                                                              |
| ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `id`                                 | yes      | route segment; defaults to the file path. `home` renders at `/`                                                    |
| `title`                              | yes      | the page's `<h1>` and its `<title>`                                                                                |
| `description`                        | yes      | the meta description — a page without one is invisible to search                                                   |
| `label`                              | –        | navigation label; falls back to `title`                                                                            |
| `order`                              | –        | sort weight; the home page is always first                                                                         |
| `tags`                               | –        | subset of `menu`, `footer`, `contact`. **An unknown tag means a nav entry silently vanishes.**                     |
| `page`                               | –        | template component to render, e.g. `page: Landing`                                                                 |
| `noindex`                            | –        | excluded from the index and the sitemap                                                                            |
| `noSsr`                              | –        | client-only render. **Avoid for content** — a `noSsr` page has no prerendered `<h1>` or body, so `verify` fails it |
| `image`                              | –        | social card image (absolute or root-relative)                                                                      |
| `headerImage`                        | –        | illustration behind the page title; distinct from `image`                                                          |
| `lang`                               | –        | BCP-47 tag when this page is not in the site's language, e.g. `nl`                                                 |
| `alternates`                         | –        | `[{ lang, path, label? }]` — the page's other languages, emitted as hreflang and shown as a header language switch |
| `breadcrumbs`                        | –        | trail, outermost first; drives the visible trail _and_ `BreadcrumbList`                                            |
| `faq`                                | –        | `[{ question, answer }]`; rendered and mirrored as `FAQPage`                                                       |
| `cta`                                | –        | `{ message, route }` or `{ message, href }` for a `mailto:`/`tel:` action — the page's one primary action          |
| `subpages`                           | –        | ids nested under this page in the navigation dropdown                                                              |
| `cards`, `lists`, `images`, `videos` | –        | structured content rendered by the templates                                                                       |

### Heading rule

**The page template owns the single `<h1>`.** Start markdown headings at `##` — the renderer demotes
anything shallower automatically, but writing `##` is clearer. Two `<h1>`s fails `verify`.

## The SEO contract

**Never hand-write `<head>` tags and never set meta tags in frontmatter.** `useSeo` builds them from
your frontmatter and the site config, in the layout, so they are emitted for every route including
`noSsr` and lazily-loaded pages.

Put site-wide facts in the `ssg` block of `vitrify.config.ts`, not in pages:

```ts
extra: { phone, email, address, serviceArea: [...], rating, reviewCount, reviews: [...] },
jsonLd: { business: { type: 'Plumber', openingHours: [{ days: ['Mo'], opens: '08:00', closes: '18:00' }] } }
```

Those fields feed the visible proof section _and_ `LocalBusiness` structured data from one source, so
the page and the crawler cannot disagree.

`ssg.lang` must be a **Quasar language pack id**, not a bare language code: Quasar writes the
`<html lang>` from the pack it loads, and the template passes `ssg.lang` through as `vitrify.lang`.
Use `en-US`, `en-GB`, `nl`, `de`, … (see `node_modules/quasar/lang/`). A bare `en` has no pack and
Quasar silently falls back to `en-US`, so `og:locale` and `<html lang>` would disagree.

### A second language

A translated page declares its own `lang` and the set of translations it belongs to. Per page:

```yaml
lang: nl
alternates:
  - { lang: en-GB, path: /, label: English }
  - { lang: nl, path: /nl, label: Nederlands }
```

List the page itself too: a self-referencing hreflang is what makes the cluster valid. The header
renders a language switch from `alternates`, filtered to the pages a visitor can actually reach, and
a page without `alternates` shows no switch.

Declaring this in every page is repetitive, and a page whose twin is missing is the bug that bites.
Both are avoided by deriving `lang` and `alternates` in `src/router/routes.ts` from the page id —
`simsustech/website` pairs `website` with `nl-website` there, so adding the translation is the only
step needed.

`ssg verify` checks, per page: exactly one `<title>`, exactly one canonical that is absolute and on the
configured origin, a non-empty description, at least one parseable `application/ld+json` block, exactly
one `<h1>`, and a `lang` on `<html>`. `noindex` pages are exempt from canonical/description/JSON-LD.

## Conversion rules (landing/business)

- **One primary CTA per page.** Competing actions split attention. The hero carries it above the fold.
- **Proof next to the action**, not below the fold — a rating and review count directly under the CTA.
- **A sticky mobile call bar** is already in the landing layout; it is the main mobile conversion path
  for a local business. Give it a phone number via `ssg.extra.phone`.
- **Use token colour pairs** (`--q-color-primary` on `--q-color-on-primary`) for CTAs. Never `accent`
  on a primary background — that is a contrast failure and fails `verify`.
- **Images**: explicit `width`/`height` always; the hero image is the LCP element (`fetchpriority="high"`),
  everything else `loading="lazy"`.

## Budgets

`ssg verify` fails on these (gzipped transfer size, measured from the build output):

| budget     | limit  |
| ---------- | ------ |
| JavaScript | 250 KB |
| CSS        | 60 KB  |

accessibility, best-practices and SEO scores **must be 100**; performance warns below 90. Override with
`--js-budget <kb>` / `--css-budget <kb>`. Pass `--ignore <glob>` (repeatable) to leave non-page HTML
out of the SEO surface check — a third-party drop-in such as a Google site-verification file ends in
`.html` but has no title, canonical or structured data.

Lighthouse needs a Chromium binary: set `CHROME_PATH`, or run `ssg verify --no-lighthouse` to check the
deterministic half only (SEO surface + byte budgets) where no browser is available.

## Anti-patterns (each of these was a real defect in this project)

- Importing `QuasarPreset` from `vitrify` — it is exported by `unocss-preset-quasar`, and it throws
  without a `style`.
- Forgetting to register `QuasarPlugin` in `vitrify.plugins` — SSR throws and every page ships an
  **empty `<div id="app">`**.
- Leaving `'Meta'` out of `quasar.framework.plugins` — **no meta tags are ever emitted**.
- Writing a bare, unprefixed `import.meta.glob` path — Vite rejects it ("Invalid glob … must start with
  '/' or './'") and **every page silently disappears**.
- Statically importing `QMarkdown`/`QMediaPlayer` — pulls markdown-it into the client bundle for pages
  that render no markdown.
- Putting `*` followed by `/` inside a block comment — it closes the comment early and the rest of the
  file parses as code.
- Putting `role="button"` on a `q-item` — overrides its list semantics and fails `aria-required-children`.

## Where to look next

- `CONTENT-BLUEPRINT.md` — what to write: service × location matrix, internal linking, E-E-A-T.
- `CONTEXT.md` — the architecture and why it is shaped this way.
- `docs/adr/` — the two load-bearing decisions.
