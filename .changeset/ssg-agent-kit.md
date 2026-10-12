---
'simple-site-generator': minor
'@simple-site-generator/templates': minor
'create-simple-site-generator': minor
---

Rewrite the project as an agent-focused site-generation kit.

## `simple-site-generator` — now the kit, with an `ssg` CLI

Replaces `create-simple-site-generator` with a real command surface:

- `ssg init [dir] --template docs|landing|business --yes` — scaffold a project. Non-interactive when
  stdin is not a TTY, so an agent can run it.
- `ssg add-page <id>` — create a page with frontmatter that already satisfies the schema. Refuses to
  overwrite.
- `ssg check` — validate every page: required `title`/`description`, unique ids, known tags, and
  `subpages` entries that resolve. This is the guard that turns a silent frontmatter mistake into a
  terminal error.
- `ssg build` — `vitrify build -m ssg`.
- `ssg verify` — assert the built site: the SEO surface of every page, gzipped byte budgets
  (JS ≤ 250 KB, CSS ≤ 60 KB) measured from the build output, and Lighthouse scores (accessibility,
  best-practices and SEO must be 100; performance warns below 90).

Dependency versions are pinned rather than resolved over the network at scaffold time, so `ssg init`
works offline and produces the same project every run.

Includes `AGENTS.md` (the canonical instructions), `SKILL.md` (a pointer to it) and
`CONTENT-BLUEPRINT.md`.

## `@simple-site-generator/templates` — three modules over one shared layer

The five templates (`documentation`, `one-page`, `personal`, `small-business`, `small-business-v2`) are
**removed** and replaced by `docs`, `landing` and `business`, composed from a shared layer
(`SiteShell`, `Hero`, `CtaButton`, `ProofSection`, `BentoGrid`, `FaqList`, `Breadcrumbs`, `PageContent`,
`StickyCta`, `tokens.css`, and pure `nav.ts`/`headings.ts`).

**Migration:** import `docs`, `landing` or `business` instead of the removed names. Their `Layout` and
`Page` exports are unchanged in shape.

Also adds a `./seo` entry with the pure SEO builders (`buildMeta`, `buildJsonLd`, `buildSitemap`,
`buildRobots`) and the `ssgSitemap` build plugin, for use by build tooling that cannot import `.vue`.

## Fixed

- Quasar is now actually registered (`QuasarPlugin` in `vitrify.plugins`), with `'Meta'` enabled. Before
  this, prerendered pages shipped an **empty `<div id="app">`** and **no meta tags at all**.
- `QuasarPreset` is imported from `unocss-preset-quasar` (not `vitrify`, which does not export it) and
  configured with `style: MaterialDesign3`, `iconSet: 'mdi-v7'` and
  `appExtensions: ['qmarkdown','qmediaplayer']`.
- The page glob is relative; the previous bare path is rejected by Vite and matched **zero pages**.
- Site config is exposed through a slim `virtual:ssg:site` module instead of inlining the whole build
  config — **109 KB less JavaScript** on every page.
- `QMarkdown`/`QMediaPlayer` load lazily, keeping markdown-it out of the client bundle for pages that
  render no markdown.
- Accessibility: a skip link, a single `<main>`, real `<h1>`s, and accessible names on icon-only
  controls.

## `create-simple-site-generator` — retired

Replaced by `ssg init`. The package is deprecated; its app template moved to
`simple-site-generator/templates/app`.
