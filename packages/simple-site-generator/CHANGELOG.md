# simple-site-generator

## 0.4.1

### Patch Changes

- fa44156: Pin a scaffolded project to the kit and vitrify releases that ship it.

  The dependency map behind `ssg init` pinned `@simple-site-generator/templates` and
  `simple-site-generator` to `^0.2.0`, and `vitrify` to `^0.30.0`. A caret on a `0.x`
  version does **not** float to the newest release — `^0.2.0` means `>=0.2.0 <0.3.0`
  — so a site scaffolded the day after 0.4.0 shipped installed kit 0.2.0: retired
  template names, the pre-hashing bundler, and none of the fixes. The scaffold looked
  current and produced a project two releases old.

  Now `^0.4.0` and `^0.32.0`, and `tests/cli/init-templates.spec.ts` asserts each
  pin against the version in this workspace, so a release that forgets them fails the
  CLI suite instead of quietly scaffolding a stale site again. The templates package's
  own `vitrify` dev-dependency moves to `^0.32.0` with it, so the version the kit is
  developed against is the version a new site receives.

- 2a96441: Match the hash the bundler emits in the scaffolded cache rule.

  The scaffolded `Cache-Control` rule matched `-[A-Za-z0-9_]{8,}` after the dash, but
  Rolldown hashes are base64url, so a hash containing `-` — `index-1HO4-Wjr.mjs` —
  was silently left out of `immutable`. That rule exists for nothing else, so the
  failure was invisible: the file still loaded, it just revalidated.

  Eight characters exactly, not "eight or more": an open-ended class matches a
  hyphenated word as readily as a hash (`server-renderer.mjs`).

- fef5d11: Stop a scaffolded site from serving its own Caddyfile.

  The scaffold copies `build/Caddyfile` into `dist/static/` — that is how the file
  reaches the server, which imports it from the web root — so `GET /Caddyfile`
  returned the entire configuration, comments about the server included, on every
  site created from this kit. Both `file_server` blocks now `hide Caddyfile`, in
  `build/Caddyfile.hbs` and in `build/Caddyfile.preview`, which serves the same
  artifact locally.

  The argument is a file name, not a path: `hide /Caddyfile` validates and then does
  nothing at all. Measured against a running Caddy 2.11 — `hide Caddyfile` answers
  404, `hide /Caddyfile` answers 200. The scaffold test asserts over directives
  rather than raw text, because the comment that explains this names both forms.

- fa44156: Write a site name with an ampersand as itself, not as an HTML entity.

  `ssg init` renders the scaffold through Handlebars, and the double-brace form
  escapes for HTML. That is right for `build/Caddyfile` and the deploy workflow and
  wrong for every value that lands inside a JavaScript string: a site named
  a display name containing `&` was written into `vitrify.config.ts` as its HTML
  entity (`&amp;` instead of `&`),
  which then renders as `&amp;amp;` in `<title>` and puts an escaped name into the
  JSON-LD, the OpenGraph tags and the sitemap. Measured on a site scaffolded from
  this kit, and fixed there by hand before this.

  The three affected values (`title`, `url`, `description`) now travel to the
  template already quoted as JavaScript string literals (`JSON.stringify` in
  `init.ts`) and are inserted raw, so quotes and ampersands survive as themselves.
  A quote in a site name is the same bug seen from the other side, and it would have
  produced a config file that does not parse.

- fa44156: Write `404.html` for a scaffolded site, and ship the guard that checks it.

  The scaffolded `build/Caddyfile` rewrites a missing URL to `/404.html`, and
  nothing ever created that file: the prerenderer writes one HTML file per concrete
  route `path`, and the router's only error route was the `:catchAll(.*)*` pattern.
  Every site built from this kit therefore answered a mistyped URL with status 404
  and an **empty body** — measured on two of them, 0 bytes.

  The scaffold's router now carries an explicit `404` route beside the catch-all,
  with the same component and a shared `notFoundMeta` that includes a `description`.
  That last field is not optional: `ssg verify` requires one on every built HTML
  file, so the new route fails the build without it — which is how the gap was
  found.

  The scaffold also ships `test/caddyfile.test.ts`, the guard every patched site
  grew by hand: `hide Caddyfile` in each `file_server` and never with a leading
  slash, a base64url hash class of exactly eight characters, and the `/404.html`
  rewrite. Until now a freshly generated project had no test file at all, so its own
  `pnpm test` exited non-zero on "no tests found" — read as a broken scaffold.

## 0.4.0

### Minor Changes

- a457581: Let a card carry a photo, so a product catalogue is frontmatter.

  `cards` could say `header`, `content`, `icon` and `cta` — everything except the one thing a
  catalogue card actually is: a picture of the thing being sold. A plant, a room, a dish cannot be
  replaced by an icon, so a site with a catalogue had no way to express it and the alternative was a
  site-local page component the kit does not own.

  `image: { src, alt?, width?, height?, fit? }` renders the photo above the tile's heading, bled to the
  card's edges, and fills the plate `width`/`height` reserve — cropped (`fit: cover`, the default) or
  shown whole inside it (`fit: contain`).

  `fit: contain` is what a catalogue needs when its photos were not shot at one ratio. Without it a site
  has only one honest option — author each photo's own ratio — and each card's height then follows its
  photo, so a row of a portrait and a landscape shot leaves a card half empty. Measured on a
  catalogue page: four landscape product photos next to portrait ones produced rows with a
  170px blank area inside the shorter cards. Cropping instead destroys a branch shot (the reason
  `contain` exists), so the choice belongs in the frontmatter where the author can make it. The wrapper carries the ratio, so the
  space is reserved from the numbers rather than measured after the bytes arrive: a grid of forty
  portrait photos does not reflow as it loads, and a portrait photo is not cropped to a landscape box —
  `width`/`height` are the photo's own size, with 4:3 reserved when they are absent. Everything is
  `loading="lazy"` and `decoding="async"`; `alt` falls back to the card's `header`, because that is
  what the card says the picture is, and an empty `alt` would mark a catalogue photo as decoration.

  `ssg check` now validates the card band, which it previously skipped entirely (`cards` was
  `z.array(z.unknown())`): every card needs a `header` and `content`, a photo needs a `src`, and a
  declared `width`/`height` has to be a positive integer. A card with no heading is the case that
  matters most — it names nothing, and there is nothing for a photo's `alt` to fall back to.

  An entry in `images` takes `width`/`height` for the same reason, and the landing templates now pass
  them to `HeroImage`. The hero is the LCP element and reserves its box from those numbers; with no way
  to declare a size, every portrait hero was reserved at the component's landscape 1200×750 fallback
  and jumped to shape when the file landed. `ssg check` validates `images` as well: a slide without a
  `name` is a carousel slide with no key and no caption fallback.

### Patch Changes

- 4bf2c9a: Stop writing a private-registry `.npmrc` into the generated deploy workflow.

  `ssg init` emitted a step that wrote `@simsustech:registry=https://npm.simsus.tech` with a
  `SIMSUSTECH_NPM_TOKEN` secret, plus a step that deleted it again. The kit is published on the public
  npm registry, so a generated project needs neither — and a deploy that requires a secret it does not
  use fails for the wrong reason the day the secret is missing or rotated. Both sites had already
  shipped around it.

  The workflow now has five steps: checkout, pnpm, node, install and build, rsync.

  The kit's own release workflow carried the same dead line: both packages pin
  `publishConfig.registry` to `registry.npmjs.org`, the lockfile has no private resolution, and no
  package depends on the `@simsustech` scope. That token is gone from the publish path too; `NPM_TOKEN`
  stays.

## 0.3.0

### Minor Changes

- ce5464f: Give the business template a `Landing` page and make the shared chrome usable by a site that
  is not in English: `extra.labels` now covers the skip link, the drawer, the menu, the footer,
  the back-to-top control, the proof section, the gallery controls and the sticky bar; trust marks
  render from `extra.qualityMarks`; markdown tables and the contact list get prose styling; the
  gallery loses its 700px layout shift and gains named controls and a counter; the header keeps the
  phone and the customer login from 1024px and lets the navigation collapse instead; the header
  navigation and the drawer both mark the current page through Quasar's own `q-item`/router classes
  rather than a hand-rolled comparison, with the marker carrying the contrast that the primary token
  alone did not; the page gutter is an alias for the preset's own spacing token instead of a second
  copy of its value, and the tinted hero band carries the same bottom margin as the business title
  band so the first section no longer starts on the band's edge, and a tinted hero that opens the page
  cancels the page gutter above itself so its colour meets the header instead of leaving a 12px seam; the business title band is compact —
  the page's `description` is a meta description and is no longer printed as a lede, the padding is one
  step smaller, the header's overflow menu no longer opens with a phone number, and the fixed action bar offers the
  contact page beside booking instead of the phone; a `lists:` entry can be
  marked `clientOnly`, which renders it inside `q-no-ssr` so a harvestable link never reaches the
  prerendered HTML; the site-wide
  social-card image is emitted as an absolute `og:image`. `ssg init` installs the `ssg` binary,
  derives a valid package name from `--site-name`, pins the current release line, writes the host
  (not the origin) into the Caddyfile and the rsync path, and emits `page: Landing` for `business`.

  Three defects the the reference site surfaced once it ran this work are fixed: the business
  title band and its decorated variant were two complete page headers rendered on one element, so the
  band's `display`, `flex-wrap` and bottom margin came from whichever rule the sheet put last — the base
  is now layout-neutral and `--decorated` owns the row; the band's process graphic was an absolute
  overlay sized by width, so the compact band clipped all but its top 100px — it is a flex child now and
  the band grows to hold it; and the header's language switch had a class no shortcut defined, which
  left it as an unstyled, underlined link in the browser's own colour (it was even listed as "unstyled
  by design" in the verifier). The drawer's contact group also emitted a `<hr>` and a label as direct
  children of `role="list"`, which fails Lighthouse's `aria-required-children` on any site that uses that
  group. `ssg init` and the docs now match the templates package **by path** in the UnoCSS content scan:
  a `link:`ed kit is resolved to its real location, so a name-only matcher scanned nothing and the site
  lost the Quasar component CSS and every icon the templates render.

  A page can now declare `alias`, which the scaffolded route table hands to Vue Router as extra paths —
  for the English slug a page had before it was renamed. It is a client-side alias only: Vitrify's
  `routesToPaths` reads `path` and ignores `alias`, so an alias writes no HTML and a static host answers
  it with the 404 page. The README says so and pairs it with the `redir` a renamed page needs where the
  site is served.

  The `Landing` hero photo now carries an edge of its own: an outline-token hairline plus a two-layer
  shadow whose darkest point is at the picture's own edge, and the cards' card radius instead of a
  smaller one. The previous single soft shadow left the band under the picture only 30-44 levels darker
  than itself and ramped away over 40px, which reads as a wash rather than as depth — and the ring that
  was meant to define the edge sat at the same brightness as that wash.

  `ssg check` now warns — without failing the run — when a page's body opens with a heading that repeats
  its own `title` or `label`. The templates render `title` as the page's single `<h1>` above the markdown,
  so a body that opens with the same words prints the title twice; on the reference site 22 of 38 pages
  did exactly that, and it is invisible to `tsc`, to the SEO surface check and to the byte budgets. It is
  a warning because a page may legitimately name a later section after itself.

## 0.2.0

### Minor Changes

- f6938d7: Add the hero process graphic, and give the business template a hero to hang it on.

  A page can now declare its own process in frontmatter:

  ```yaml
  demo:
    label: From Markdown to a deployed site
    steps:
      - Write Markdown
      - Build
      - Deploy
  ```

  The templates draw it as an inline SVG — a route with a named stop per step, a
  bright segment travelling the route, and each stop's ring pulsing in turn — using
  nothing but `transform` and `stroke-dashoffset` keyframes. No JavaScript, no
  layout shift, and it renders in the prerendered HTML before any bundle loads.
  Colours come from `--q-primary` / `--q-outline-variant`, so it re-themes with
  `body--dark` like everything else.

  Two deliberate choices:

  - **A process, not an abstract shape.** The conversion research the template's
    content rules come from names "abstract geometric shapes" as the first
    generic-imagery anti-pattern. The geometry is generated from the declared stop
    count, so the picture is specific to the page rather than decoration, and the
    labels are the picture — the SVG is one `role="img"` with a single accessible
    name, so a screen reader does not read them twice.
  - **Motion is geometry, never opacity.** An opacity animation on content failed
    the contrast gate once already (`ssg-reveal` — a low-vision reader who never
    scrolls to the element keeps it permanently dimmed). The moving parts here are
    decoration, but the no-opacity rule is kept unconditional.

  `Business` had no hero at all — its home page rendered like any other page, a
  title band and nothing beside it. It now renders the graphic in that band when a
  page declares one, and prefers it over the band's background illustration, since
  both want the same right-hand third and the illustration would sit behind the dot
  grid. The copy column narrows to make room, and the whole graphic is hidden below
  `lg`, where the labels stop being legible first. `Landing` uses it as the hero's
  aside when a page has no screenshot — a real screenshot always wins, because
  showing the product beats drawing it.

  `demo` is validated in `ssg check`, not just typed: a single stop is a dot with a
  label rather than a process, and the templates fail silently, so the schema is
  the only place a malformed `demo` is visible before the live site.

  Newly exported: `HeroDemo`.

- b9c62d5: A loud failure for an unknown `page:`, and a gate for markup that nothing styles.

  Both changes exist for the same reason, which the kit keeps meeting: **a defect
  that renders plausibly instead of failing.**

  **An unknown `page:` now fails the build.** The router used to fall back to the
  template module's `Page` when the named component did not exist:

  ```ts
  componentName && templates[componentName]
    ? templates[componentName]
    : module.Page
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
  parses as a computed member access, silently drops the _next_ entry, and left
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

- 8b2366f: Stop shipping the UnoCSS scanner's leavings, and block the heading-tag landmine.

  Three things, all one problem: the scanner reads candidates out of _text_, not
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

- 013e828: Add a fourth template, `plain`, and reduce colour to a single source.

  `plain` is the sober template for a local business with one service and one
  action. The page opens with the price and the CTA, then the four steps, then the
  prose — the site it was written for ended every page in "vraag een offerte aan"
  and never named a number. Its styling lives in `design.ts` as `ssg-plain__*`
  shortcuts beside `ssg-business__*`, so it inherits the type scale, the 8-point
  rhythm and the MD3 role tokens, and a missing class is a failure in `ssg verify`
  rather than a drift nobody sees.

  Colour now has exactly one input. The scaffolds used to pass both a nine-entry
  `colors` map and a `sourceColor`; only the second was read, and the first was
  spread into the UnoCSS theme where it produced utilities that disagreed with the
  templates' own role tokens. `ssg init` no longer writes a `colors` block, the
  theme is `ssgUnoConfig.theme` whole, and the package exports `ssgSourceColor` as
  the default a new site starts from.

  The header also gained two guarded chrome elements the plain template asks for:
  the phone number and the client-login link, both read from `extra` and both
  rendered only when set. The login is marked external, opens in a new tab, and
  moves into the overflow menu on a narrow screen.

- f6938d7: A principles band, a prose column that fits its illustrations, and a hero graphic
  that stays off the phone.

  **`principles:` replaces the philosophy illustration.** A page can now declare a
  band of numbered rules:

  ```yaml
  principles:
    heading: Simple, sustainable technology
    leading: Four rules, applied before choosing anything.
    items:
      - title: Simple by default
        text: The smallest stack that solves the problem.
    note: Each rule removes work later.
  ```

  `PrincipleGrid` renders it in the business template between the prose and the
  service cards. It replaces a 1200px SVG that was a picture of text: not
  selectable, not searchable, not translatable, not reflowable, and — being an
  image — guaranteed to be the wrong size for somebody. The visible number is
  `aria-hidden` because the list is an `<ol>`, so a screen reader hears "1 of 4"
  rather than "1 one, 2 two".

  **The prose block is a container again, not a measure.** Applying `max-w-measure`
  to the whole block constrained every illustration to 68ch: the site's SVGs are
  authored at ~1200px and were drawn at about 40% of that. Now the measure caps
  running text only, and a paragraph holding nothing but an image is treated as a
  figure and left uncapped.

  Two details that took a second pass to get right, both caught by measuring the
  rendered page rather than reading the CSS:

  - Markdown wraps a standalone image in a `<p>`, so capping paragraphs capped the
    illustration with it. The first attempt widened the column and changed nothing
    measurable — illustration 680px, paragraph 680px.
  - `width: auto` rather than `width: 100%` on images, so a small raster is not
    upscaled across the full column. An SVG with only a `viewBox` has no intrinsic
    size and fills the box it is given, which is what an illustration wants.

  **The hero graphic no longer paints over the headline on mobile.** `ssg-demo`
  declared `display: block` while the band's variant declared `hidden`; two
  single-class selectors setting the same property are resolved by stylesheet
  order, not intent, and `block` won. The graphic was absolutely positioned over
  the copy on every phone. The `block` was redundant — a `<figure>` is block by
  default — so it is gone, and the shortcut table now asserts that a base class does
  not set a `display` value a variant also sets.

  Also guarded: the preflight CSS lives in template literals, where a stray backtick
  ends the literal and the build fails with a parse error pointing at an unrelated
  line. Three occurrences while writing this. A text-level test now reads the source
  (not imports it, since a broken literal does not parse) and names the offending
  line; the shortcut table has its own shape check, because a shortcut that loses
  its separating comma parses as a computed member access, silently drops the entry
  after it, and leaves every gate green.

- 013e828: A document title that names the site first, and a page that can opt out of it.

  **Page titles name the site first.** `<title>` was `<page> · <site>`; it is now
  `<site> | <page>` — `simsustech | Contact`. A tab, a bookmark and a search
  result are all places a page appears with no surrounding context, and the site
  name is the part that has to survive truncation.

  **A page can declare its own document title.** `headTitle` replaces the title
  outright, suffix and all:

  ```yaml
  title: Simple, sustainable technology for professionals # the <h1>
  headTitle: simsustech # the document title
  ```

  The suffix exists to name the site _inside_ a page's title. The front page _is_
  the site, so there the rule produces `simsustech | simsustech`. `headTitle` is
  how that exception is declared — on the page — rather than guessed by the SEO
  layer from `id: home`, which a multilingual site does not use for its second
  front page (the Dutch one is `nl`). `og:title`, `twitter:title` and the
  `WebPage` JSON-LD entity follow it, so a page never states two different names
  for itself.

- 04ce095: Rewrite the project as an agent-focused site-generation kit.

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

  ## `create-simple-site-generator` — removed from the workspace

  Replaced by `ssg init`. Its app template moved to
  `simple-site-generator/templates/app`.

  The package is no longer a workspace package, so it is deliberately **not** named
  in this changeset's frontmatter: a changeset may only version packages that
  exist, and `changeset version` fails outright on an unknown name ("Found
  changeset … for package … which is not in the workspace"). Its last published
  version therefore stays on the registry and simply receives no further releases.
  Its users switch to `ssg init`.

### Patch Changes

- c813e89: Answer 404 for a missing page instead of serving a file with a 200.

  The generated Caddyfile ended `try_files` with `/index.html`:

  ```
  try_files {path}.html {path} /index.html
  ```

  so **every mistyped URL returned the home page with status 200.** Google indexes
  that as a real page — one URL per typo, all duplicates of the home page — and
  uptime monitoring sees success where a visitor saw the wrong page. A `/404.html`
  fallback is no better: the status is still 200.

  Both containers now answer a real 404 and still show the site's own error page:

  ```
  try_files {path}.html {path}
  file_server
  # ...
  handle_errors {
  	root * /srv/{{ url }}
  	@notFound expression {err.status_code} == 404
  	rewrite @notFound /404.html
  	file_server
  }
  ```

  Verified against a built site: `/website` 200, a missing page 404 with the
  generated error page as the body, a real asset 200, a missing asset 404.

- 9cc2af5: Drop the `@quasar/quasar-ui-qmarkdown` dependency.

  The templates render the HTML that `vite-plugin-markdown` produced at build time,
  so nothing imports the component any more: it was still installed by every
  consumer, and every project `ssg init` scaffolded, for a package nothing used.

  The prose styles do not come from that package. They come from the preset's
  ported selectors — which the app declares by name with `appExtensions:
  ['qmarkdown']` — plus the design system's own prose rules and the browser
  defaults. Measured on the the reference site, removing the declaration too would
  drop ~10 KB of raw CSS and change exactly one rendered property (the link
  underline offset), since those pages use no code blocks and no tables.

  `@quasar/quasar-ui-qmediaplayer` stays: the templates still lazily load the
  player for pages with video.

- 3c4e47b: Make Quasar's own icons render, and give the language switch an icon.

  **The generated app handed Quasar the icon-library _name_.** Quasar then resolved
  its own font classes (`mdi mdi-menu-down`), and since no icon font is loaded,
  every icon the framework draws itself — the dropdown arrow, a select's chevron, a
  table's expander — rendered as nothing at all. The app template now passes the
  rewritten icon set from `quasarIconSet()`, whose values are iconify classes the
  preset already emits CSS for, asserted to Quasar's type at that one boundary.

  The resolution's `iconMapFn` is deliberately not passed: Vitrify serialises the
  Quasar config into the client bundle and a function does not survive the trip —
  passing it made the arrow throw `toClass is not defined`. Bare icon names need
  that mapper, so write `i-mdi-*` names.

  **The language switch in the header is now labelled with an icon** (`i-mdi-translate`)
  as well as the language name, matching how the same choice appears in the
  overflow menu.

- cab20d7: Emit the package root, and rebuild the generated 404 page.

  **`@simple-site-generator/templates` had no root entry point.** The library build
  derives its input from directories that contain `<name>/<name>.ts`, so
  `business/`, `docs/`, `landing/`, `design/` and `seo/` were built and `index.ts`
  — a _file_ — was not. The package still advertised `"."` in its `exports` map and
  shipped `index.d.ts`, so `import { CtaButton } from '@simple-site-generator/templates'`
  type-checked in every editor and failed to resolve in every build. `index.ts` is
  now an entry, and the barrel exports `demoteH1` alongside `demoteHeadings`.

  **The generated 404 page** was written against the pre-UnoCSS design system and
  inherited three defects: a `fullscreen` overlay that hid the header and footer, so
  a lost visitor had no navigation; `bg-primary text-white` with a
  `color="white" text-color="blue"` button — Quasar blue on a green page, measured
  at **2.54:1**; and a `<style scoped>` block referring to `--ssg-step-2` and
  `--ssg-space-2`, tokens that no longer exist, so its type and spacing were
  silently unset. It is now a normal section inside the shell, using the kit's
  `CtaButton` so the colour pair cannot be hand-picked again.

  **The mobile drawer** listed only `menu`-tagged pages, and the contact page is
  tagged `contact` because the header renders it as its own button — a button that
  lives in the desktop navigation, hidden below `lg`. On a phone the drawer was
  therefore the only navigation and had no way to reach the contact page. It now
  mirrors the header's contact menu, under the same label and with each page's own
  icon.

- 736e9d0: Express the templates' styling as UnoCSS configuration, and measure the site the way a host serves it.

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
    site whose host would pass — the the reference site's mobile performance score
    went **59 → 85** from the server change alone.
  - The generated app template: wires the design system into `vitrify.unocss`,
    scans the whole templates package for classes, points the font preconnect at
    the provider the preset actually uses (`fonts.bunny.net`), and its Caddyfile
    caches fingerprinted assets immutably.

- c157d0a: Fix the verifier, the generated app's head and the drawer's list semantics.

  All of these were found by building a real site (the the reference site) with the
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
    mangled the document and left every injected meta tag _inside a comment_. The
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

## 0.1.3

### Patch Changes

- b9491bb: Modernize the toolchain: oxlint and oxfmt replace eslint and prettier, and
  everything moves to pnpm 12 and Node 20.19+, with dependencies updated (vite 8,
  vue 3.5.42, quasar 2.32, vitrify 0.28).

  Scaffolded projects now ship `.oxlintrc.json`/`.oxfmtrc.json` and the oxc VS
  Code extension instead of the eslint stack, pin TypeScript 6, and their deploy
  workflow uses the current GitHub Actions.

## 0.1.2

### Patch Changes

- 3d32e99: fix(templates): fix QPageScroller

## 0.1.1

### Patch Changes

- df9b484: Update packages
