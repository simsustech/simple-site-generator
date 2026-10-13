# Migrating a site to the current kit

**The short version: this is not an upgrade, it is a re-render.** Between the
published `0.1.x` line your sites are on and the current kit, the styling model
changed from "the template ships a stylesheet" to "the design system **is** the
UnoCSS configuration the app must merge". A site that does not merge it renders
unstyled — not subtly, entirely. The templates package's own changelog records
this happening: a hero lost its background because it used utilities "consumers
without a `vitrify.unocss` config never generate".

So the work is not `pnpm up`. It is: take the content, put it in a site built by
the current `ssg init`, and delete everything the kit now owns.

## What changed, and why it matters

|           | old sites (`0.1.8`–`0.1.20`)                                 | current kit                                                                     |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| templates | `small-business-v2`, `personal`, `one-page`, `documentation` | `business`, `landing`, `docs` — all three **retired** names are gone (ADR-0002) |
| styling   | own styles / template stylesheet, `globalCss`                | `ssgUnoConfig` merged into `vitrify.unocss`; **no stylesheet exists**           |
| the shell | the site owns `src/layouts/MainLayout.vue` + header + footer | `SiteShell`/`SiteHeader`/`SiteFooter` come from the template module             |
| `<head>`  | page components called `useMeta`                             | the **layout** produces it from frontmatter (ADR-0001)                          |
| sitemap   | a `generateSitemap.mjs` script you run after the build       | `ssgSitemap` plugin in `vitrify.config.ts`                                      |
| tooling   | eslint + prettier + `sitemap-ts`                             | oxlint + oxfmt, `ssg check` / `ssg verify`                                      |
| versions  | vitrify 0.19, vue-router 4.5, quasar 2.18                    | vitrify 0.28, vue-router 5, quasar 2.32                                         |
| markdown  | `@quasar/quasar-ui-qmarkdown` rendering on the client        | build-time HTML via `vite-plugin-markdown`; QMarkdown **removed**               |

Two of those are the ones that actually cost time: `ssgUnoConfig` (or nothing
renders) and the retired template names.

## Which of your sites is where

| site                               | pinned    | template            | notes                                                                |
| ---------------------------------- | --------- | ------------------- | -------------------------------------------------------------------- |
| `hvbnicky`                         | `^0.1.20` | —                   | closest to current; on oxlint-era tooling                            |
| `websites/www.vanhemertflowers.nl` | `0.1.17`  | `small-business-v2` | **retired name**; eslint/prettier; `globalCss` already commented out |
| `websites/personal`                | `0.1.11`  | `personal`          | **retired name**; `link:` dep                                        |
| `websites/www.bouman-bouman.nl`    | `0.1.11`  | —                   | `link:` dep                                                          |
| `www.bouman-bouman.nl`             | `^0.1.8`  | —                   | looks like a stale duplicate of the above                            |
| `blondegarant`                     | `^0.1.18` | —                   |                                                                      |
| `simsustech/website`               | `file:`   | `business`          | **already migrated** — use it as the reference                       |

Do the smallest site first, and do `websites/personal` and `www.bouman-bouman.nl`
only after deciding whether they are still live: they pin `link:` to the kit's
working tree, so they change behaviour whenever the kit does.

## The procedure

Recommended: **port into a fresh scaffold**, rather than upgrade in place. The
content is Markdown and the frontmatter contract is enforced, so the content
survives; the shell, styling and tooling are kit-owned now, which is the whole
point of ADR-0002.

### 1. Build the new site beside the old one

```bash
cd ~/Projects/simple-site-generator && pnpm install && pnpm build
cd <parent-of-the-old-site>
node ~/Projects/simple-site-generator/packages/simple-site-generator/dist/cli.js \
  init <new-dir> --template business --site-name "…" --url "https://…"
cd <new-dir> && pnpm install
```

Pick the template that matches the old one:

- `small-business`, `small-business-v2`, `personal` → `business`
- `one-page` → `landing`
- `documentation` → `docs`

### 2. Merge the design system — the one change that matters

In `vitrify.config.ts`, this is the whole migration:

```ts
import { ssgUnoConfig } from '@simple-site-generator/templates/design'

vitrify: {
  unocss: {
    presets: [QuasarPreset({ /* … */ })],
    ...ssgUnoConfig,                       // theme, shortcuts, preflights, safelist
    theme: { ...ssgUnoConfig.theme, colors: ssg.colors },
    content: {
      pipeline: {
        include: [
          /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
          // NOT optional: the templates render Quasar and icon classes
          // (`q-separator`, `i-mdi-phone`) that exist only because the built
          // package is scanned. Measured: 137 selectors depend on this.
          new RegExp(`${ssg.templatePackage}.*\\.js`)
        ]
      }
    }
  }
}
```

Then **delete `globalCss`**. The templates package no longer builds CSS at all;
that entry used to import the UnoCSS scanner's leavings and nothing else.

`simsustech/website/vitrify.config.ts` is the reference implementation of all of
the above.

### 3. Delete what the kit now owns

- `src/layouts/MainLayout.vue` — the layout comes from the template module. If it
  is still the "Quasar App / Essential Links" starter, delete it now.
- any site-local header, drawer, footer or scroll-to-top component.
- `src/components/` entries that duplicate `Hero`, `BentoGrid`, `ProofSection`,
  `FaqList`, `Breadcrumbs`, `CtaButton`, `StickyCta`, `PageContent`.
- the site's own stylesheets and `tokens.css`-style files.
- `generateSitemap.mjs` and its `sitemap-ts` dependency.
- `@quasar/quasar-ui-qmarkdown` and any `appExtensions: ['qmarkdown']` — the kit
  renders Markdown to HTML at build time and styles it with `ssg-prose`.
- eslint/prettier config; copy the scaffold's `.oxlintrc.json`/`.oxfmtrc.json`.

### 4. Move the content

Copy `src/pages/**` across, then let the contract find the problems:

```bash
pnpm check      # validates frontmatter against pageFrontmatterSchema
```

`ssg check` reports every issue with a file and a path, and it is cheaper than
reading the schema. Expect to fix:

- `id` must be present and unique — it is the route.
- `page:` now names a **current** module: `business`, `landing`, `docs`.
- `description` is required on every page.
- `icon` is `{ name: i-mdi-… }`, resolved through Quasar's icon set.
- typed fields must be added to `packages/templates/src/shared/types.ts` if you
  introduce new ones — **a field missing from that type is never exposed as a Vue
  prop**, so it lands in `attrs` and the component silently renders without it.
  The code documents this trap on `cta` and `headerImage`.

### 5. Replace pictures of text

If a page uses an SVG that is mostly _words_ — an infographic, a "four steps"
panel, a process diagram — replace it with markup. As an image it cannot be
selected, searched, translated or reflowed, and the prose column renders it at
40% of its authored size. This kit now has two ways to do that:

- `principles:` frontmatter — a numbered card band (`shared/PrincipleGrid.vue`).
- `demo:` frontmatter — an animated, token-themed process graphic
  (`shared/HeroDemo.vue`), or a real screenshot where one exists.

Keep genuine illustrations as images. They now render near their authored size:
the prose block is a container, the measure caps running text only.

### 6. Verify, then look

```bash
pnpm build && pnpm check && pnpm exec tsc --noEmit
CHROME_PATH=/usr/bin/chromium pnpm verify
pnpm preview        # http://localhost:8090
```

`ssg verify` fails hard on the deterministic half (SEO surface, gzipped byte
budgets: JS ≤ 250 KB, CSS ≤ 60 KB) and warns on Lighthouse performance. The JS
budget is the one that bites: Quasar's runtime dominates it and the docs template
already measures ~248 KB of 250 KB.

Then **look at every page, both themes, mobile and desktop.** This is not
optional and it is not the same as the gates passing. Everything that went wrong
in the migration that produced this document was found by screenshotting, and
none of it was found by the tests:

- a graphic that painted over the headline below `lg`, because two single-class
  selectors set `display` and stylesheet order decided the winner;
- an illustration that stayed at 680px because Markdown wraps it in a `<p>` and
  the measure capped the paragraph;
- a missing CSS export that nothing reported.

## If you must upgrade in place

Only worth it when the site owns components you want to keep. Same order, with
one addition: **`pnpm install --force` after every kit change.** pnpm _copies_
`file:` and `link:` kit dependencies, so editing the kit changes nothing in the
site until the copy is refreshed — a stale copy is the single most common reason
a kit fix "does nothing". Verify the refresh rather than assuming it:

```bash
grep -l HeroDemo node_modules/.pnpm/@simple-site-generator+templates*/node_modules/@simple-site-generator/templates/dist/*.js
```

## What not to do

- Do not migrate by bumping the dependency. The retired template names will not
  resolve, and without `ssgUnoConfig` the site renders unstyled.
- Do not keep `globalCss` "just in case". Its contents no longer exist.
- Do not add a site-local workaround for a kit defect. The kit is the product;
  fix it there and every site inherits it. The one exception recorded in
  `CONTEXT.md` — the markdown chunk-group issue in vitrify — is a vitrify-side
  bug, not an app-level one.
