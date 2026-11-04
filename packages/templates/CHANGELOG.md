# @simple-site-generator/templates

## 0.6.2

### Patch Changes

- 33d1dcf: Give the first band of a page its section rhythm back.

  `unocss-preset-quasar` gives `.q-page` a padding of `var(--q-space-md)` — 12px — and every
  page template puts `ssg-section` on that same root. Equal specificity, so the preset's rule won
  on source order and the section padding never applied: the first band of every page started
  12px under the header instead of at `space-5`, which reads as content shoved against the header
  rather than a page that begins. Measured on a business page: the `h1` at 62px with the header
  ending at 50px.

  `.ssg-shell .ssg-section` now carries the band padding, so it wins on specificity rather than on
  import order. It is written from the same `space-5` token the shortcut uses, so the two cannot
  drift, and the 12px gutter itself is untouched — a tinted hero still cancels exactly that with
  `--ssg-page-gutter`.

  The four templates whose root is `<q-page class="ssg-section">` — business, docs, landing's
  `Page`, plain — all get the rhythm back. Only a landing hero was unaffected, because its root is
  not a `q-page`.

## 0.6.1

No changes in this release.

## 0.6.0

### Minor Changes

- b872d7e: Make the business page's closing action an ending instead of a stray button.

  `business/Page.vue` rendered the frontmatter `cta` in a wrapper carrying `mt-space-5` and nothing else.
  It was spaced like a section without being one: no padding below it, so on a page whose content fills
  the viewport the button sat 12px above the footer, and on a shorter page the page-fill left it stranded
  in the middle of the gap. Left-aligned, with nothing between it and the cards above, it read as a
  control that fell off the page.

  The action closes the page as its own band now: a hairline on the article's gutter marks where the page
  ends, and the band pads above and below it. A `cta.heading` turns it into a row — the sentence on the
  left, the action on the right, stacking below `lg` — which uses the width instead of leaving a narrow
  block floating in the middle of it. Without a heading the band is centred and the button carries the
  ending alone.

  The heading renders at `text-step-2`, the section-heading step: `text-step-3` measured 42.4px, the same
  as the page's `h1`, so the closing line was competing with the page title.

  No `ssg-section__inner` is nested inside: this page is an `article` that pads its own gutter, and the
  shared inner adds a second `px-space-3` on top of it — measured in a browser, that put the button 16px
  to the right of every heading and paragraph above it. `cta.heading` is new and optional, so existing
  pages keep their content and gain only the band, the spacing and the alignment.

## 0.5.1

No changes in this release.

## 0.5.0

### Minor Changes

- b6a41a5: Let a site name its builder in the copyright line.

  The footer's legal line read `© <year> <title>`, which names the business. A site whose _builder_ holds
  the copyright — `© simsustech`, which is what several of these sites printed before they moved onto the
  kit — had nowhere to say it, because `title` is the trade name the header already shows, and adding a
  second `credit` line underneath is not the same sentence: it says "built by", not "©".

  `extra.legal` now replaces the whole line. Absent or blank, the default stands, so nothing changes for a
  site that does not set it.

## 0.4.1

### Patch Changes

- 08a7b62: Give a content list semantics its markup can support.

  `ContentList` rendered a `q-list` — `role="list"` — with the list's heading as
  its first child, and rendered every item that carries an `href` as an `<a>`, which
  Quasar leaves with the implicit link role and no `listitem` role. A list of links
  therefore had no `listitem` children at all, and the heading was an invalid child
  besides. Lighthouse reports both as `aria-required-children`; measured on the contact
  page of the first site whose lists are all links, at accessibility 95.

  The heading is a sibling now, and the container is `role="group"` labelled through
  `aria-labelledby` from that heading — a group allows a label and allows its
  children to be links, so nothing is claimed that the markup does not have. The
  items are untouched: giving them `listitem` would remove the link role, which is
  worse than the violation.

  `ssg verify` did not catch this: its Lighthouse pass covers one page, and the
  contact page was not it. A site whose lists are entirely links is the case that
  exposes it.

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

- 1587ced: Let a site credit the people who built it.

  The shell's legal line names the business — `© <year> <title>` — and that was the
  only place a credit could live once the footer moved into the kit. A site that
  put its maker in that line lost it silently in the migration: one site went from "© <builder> <business>" on every page to the
  business alone, and nothing anywhere reported the change.

  `extra.credit` is a second line under the legal one, off by default. It is
  plain text on purpose: the old credit was not a link either, and the kit has no
  business inventing a URL for whoever built the site.

- c171c79: Reserve the plain template's hero photograph, and stop dropping its clamp.

  **The hero.** `plain/Page.vue` rendered `headerImage` as a bare `<img>` with no `width`/`height`, so the figure was 0 px tall until the photo decoded and everything below it jumped down when it landed. Measured on a built site with the photo held back 1.2 s: the figure went from 0 to 190 px at 360 wide and to 300 px at 1280, for CLS 0.157 and 0.016 — thirty-five times the header-height shift this kit fixed last. With the box reserved, both are 0 and the image is in place at first paint.

  The numbers come from two new optional frontmatter fields, `headerImageWidth` and `headerImageHeight`. Unset, the hero reserves a landscape 1200×750 — the fallback `HeroImage` already uses — which trades a collapsed hero for a smaller settle if the photo is another shape. A site that knows its photo's size declares it, and the reserved box is the photo's own ratio: no crop, no reflow, `w-full h-auto` keeps the ratio while the image scales.

  Deliberately not a `QSkeleton`: the photo's size is known when the page is authored, so the box can be reserved before the bytes arrive. A placeholder would need that same reserved space to avoid shifting, would swap content in front of the visitor, and would put the real image behind a JS-driven reveal — a worse LCP for the same result.

  The size is a sibling field rather than an object in `headerImage` because sites copy this markup: a client site's own `HomePagina.vue` renders the same hero, and when `headerImage` briefly became `{ src, width, height }` its `<img>` lost its `src` and the hero vanished. `headerImage` stays the URL it always was; `test/hero-reservation.test.ts` pins both shapes.

  **The clamp.** `ssg-header__brand-name` asked for `line-clamp-3`, which belongs to the default preset chain — this design system ships without it, so the utility was dropped at build time with one `[unocss] unmatched utility` warning and the name was cut off mid-word by the brand's own `overflow-hidden` instead of ellipsized after three lines. The clamp is now written as arbitrary properties, which any preset chain emits.

### Patch Changes

- 5531589: Render a page's `cta` in the business template.

  `cta` was a dead field there. The band used to render it beside the title; when the band was cut
  back to a title and a decoration, the action went with it, and every page that declared one kept
  declaring it into nothing — the reference site's contact page ended up with no action at all, after
  its quick-pick list was removed and the prose's link was the only way left to write to it.

  The action closes the page instead, after the prose and the cards it belongs to, where a reader who
  has just been convinced needs it. `href` carries `mailto:` and `tel:` as well as `route` carries an
  in-app path, so a contact page can ask for the email without a form. It is still not in the band: an
  action repeated above the fold on every page is what made that block the loudest on ten pages in a
  row.

- 60f6bdb: Make the header the height Quasar reserves for it.

  At 1280 px and above the header measured 56 px while the prerendered page container reserved 50, so
  the layout corrected the reservation on mount and everything below the header moved down 6 px, once.
  Lighthouse reports it as CLS 0.0044 on a 1280 px viewport and 0.0000 below that — the shift never
  shows up in a score, and a visitor sees the content settle.

  The two numbers were both accidental. 50 px is Quasar's SSR default: with no browser to measure with,
  `QLayout` writes the toolbar's own minimum into `padding-top`. 56 px is the header's tallest child —
  the navigation is a `q-item`, and the MD3 one-line list container is 56 px. The nav-item shortcut
  already asked for a 40 px row, and that request was inert: `min-h-[40px]` and the preset's `.q-item`
  are both one class, so the preset's rule wins on emission order.

  The preflight now restates the 40 px with two classes (`.ssg-header__nav .q-item`), which the preset
  cannot out-rank. The header is 50 px at every width, exactly what the reservation says, so nothing is
  corrected and nothing moves; below 1280 px the nav is hidden and nothing changes at all. Desktop nav
  rows are 40 px rather than the accidental 56 — the height this design system asked for in the first
  place — with the preset's 8 px item padding intact and no clipped labels.

  `test/header-height.test.ts` pins the rule and the value it shares with the shortcut, because a header
  one pixel taller than its reservation produces exactly this shift and no other gate looks at it.

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

- 013e828: The card band's heading is a label the site owns, not a string in the template.

  Both card bands — the business template's and the landing template's — are headed
  `Services` in English. The landing template already took the word from
  `extra.cardsHeading`; the business template hardcoded it. It now reads the same
  key, falling back to that same English word, so a site can name the band in its
  own language:

  ```ts
  extra: {
    cardsHeading: 'Diensten'
  }
  ```

  It deliberately stays out of frontmatter: the heading names the band, not the
  page, so the frontmatter alternative is the same word typed into every page that
  shows cards. `extra` is site-wide, so a site whose pages are not all in one
  language resolves the right word per page in its route table — which is what the
  the reference site does.

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

- 013e828: The navigation follows the page's language, not the site's default.

  `tags` decided _which_ nav surface a page appears in, but nothing decided _whose_ — so on a site
  serving `nl/` pages, a Dutch page's header showed the English menu: `Services` leading to
  `/services`, and no Dutch page reachable from the menu at all. Only the language switch led anywhere.

  `SitePage.lang` (optional, and already carried by every route's meta) is now matched against the
  language of the page being viewed, in the menu, the contact dropdown, the mobile drawer and the
  footer:

  ```yaml
  # nl/Services/Services.md
  label: Diensten
  tags: [menu]
  lang: nl
  ```

  A page that declares no `lang` is neutral and stays in every menu, so a single-language site — which
  declares none anywhere — gets exactly the menu it had. A route that declares none (the 404 page is
  one file serving every language) falls back to the site's own language.

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

- e9a5fdd: Give the plain template the service-cards band.

  A `plain` page that declares `cards` in frontmatter now renders them under the
  prose, as the same `BentoGrid` the business template uses. Without it the band
  existed only for one template: a site built on `plain` could link to its own
  sub-pages from the prose, and nowhere else.

  `BentoGrid` is exported from the package root so an app that keeps its own page
  component (an interactive page, say) can render the same band rather than
  reimplementing it.

  Two rules carried over from the business template, because both are things a
  tile gets wrong on its own:

  - **A card's CTA needs both halves.** `cta.message` without a `cta.route` is a
    button that goes nowhere, so the pair is dropped unless both are present.
  - **The band's heading is the site's word, not the template's.** It reads
    `extra.cardsHeading`, the key `cards-band-heading.md` introduced, so a Dutch
    site says "Toepassingen" without patching the template.

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

- e9a5fdd: Let the site name the two chrome controls, and stop hardcoding English in them.

  The header's theme switch and customer login were the only strings in the shared
  chrome that were not the site's own — every other label comes from a page's
  `tags`. On a Dutch site that read as a template left half-translated: a menu
  offering "Dark mode" and "Client login" under a Dutch nav.

  `extra.labels` now carries them, the same way `extra.cardsHeading` carries the
  card band's heading, with the English words kept as the fallback:

  ```ts
  extra: {
    labels: { dark: 'Donker', light: 'Licht', clientLogin: 'Klant login' }
  }
  ```

  The theme switch continues to name the _action_ rather than the state: "Donker"
  while the page is light is the thing a visitor is looking for.

  **`ProofStrip` speaks the page's language too.** It printed `4.9/5 from 45
  reviews` for everyone, so a Dutch page showed a decimal point where Dutch writes
  a comma — one of the small tells that a page was assembled rather than written.
  It now takes `lang` (fed to `Intl.NumberFormat`) plus the two words around the
  count, defaulting to the old English rendering so no existing site changes.

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

- 02a7960: Give the layout chrome a brand tint instead of the accent colour.

  `primary` is an accent role: MD3 sets it to tone 80 in dark mode, which is bright
  on purpose, because it is meant to fill a button or an icon on a dark surface.
  The header and footer filled a full-width band with it, so in dark mode the site
  wore a luminous green slab — and fixing the text contrast only made that slab
  legible, not right.

  The chrome now wears a light tint of the same hue, and the accent stays where it
  belongs:

  |                                  | role                                             | light     | dark      | contrast        |
  | -------------------------------- | ------------------------------------------------ | --------- | --------- | --------------- |
  | header                           | `secondary-container` / `on-secondary-container` | `#d6e8cd` | `#3c4b37` | 13.3:1 / 7.2:1  |
  | footer                           | `secondary-container` / `on-secondary-container` | `#d6e8cd` | `#3c4b37` | 13.3:1 / 7.2:1  |
  | title band                       | `surface-container-high` / `on-surface`          | `#e8e9e2` | `#282b27` | 14.0:1 / 11.1:1 |
  | buttons, links, icons, band rule | `primary` / `on-primary`                         | `#006e0c` | `#46e343` | 6.5:1 / 7.7:1   |

  `secondary-container` rather than `primary-container` on purpose: the latter is
  `#75ff68`, brighter than the accent it derives from and too loud for a bar that
  appears on every page. The title band moved off the tint and onto a neutral
  surface — a band in the same tone as the header directly above it reads as one
  block, and the band keeps the brand rule down its side.

  A side effect worth knowing: the header preflight no longer has to out-specify
  Quasar's dark `--q-on-surface` rule to be legible, and `on-primary` is no longer
  referenced by the templates at all.

- de8fa9b: Stop shipping a Markdown parser to the browser.

  `vite-plugin-markdown` already renders each page's Markdown at build time, so the
  page module carries **HTML**. `PageContent` then handed that HTML to `QMarkdown`,
  which parsed it again on the client — which meant every visitor downloaded
  markdown-it (`mdurl`, `linkify`, `uc.micro` and friends) so the browser could
  redo work the build had finished.

  It now renders the HTML directly, inside the `q-markdown` class the preset's
  ported Markdown styles select, so nothing about the typography changes. Measured
  on the the reference site: the vendor chunk went from **142.7 KB to 78.5 KB gzipped**
  and total client JavaScript from 249 KB to 184 KB, with Lighthouse performance
  83 → 86 and accessibility/SEO/best-practices unchanged at 100.

  `demoteHeadings` keeps its Markdown semantics and gains `demoteH1` for the HTML
  path. The two differ on purpose: with Markdown input an author's `#` is the
  usual start, so the whole outline shifts; with HTML only a stray `h1` is a
  defect, and shifting everything would take a `##` to `h3` and skip a level.

  `test/bundle-split.test.ts` now asserts no chunk in the package contains a
  Markdown parser, which is the assertion that fails if this regresses.

- be17742: Two CSS-only motion touches, and the two traps they exposed.

  - **Blocks rise into place on scroll.** A `view()` timeline drives it, so the
    animation's progress is the element's position rather than the clock: a block
    already in view sits at its end state, there is no flash of invisible content,
    and a browser without scroll-driven animations simply shows the block.
  - **Pages cross-fade** instead of flashing white, via cross-document view
    transitions. Ignored where unsupported.
  - **Cards lift 2px on hover**, and the underline offset on links is unchanged.

  Both traps are worth knowing about:

  1. **The minifier folded the longhands into a shorthand the browser rejects.**
     `animation` plus `animation-timeline`/`animation-range` in one rule came out
     as an animation shorthand with `view()` inside it, which Chromium parses as
     invalid and drops wholesale — the reveal did nothing at all. The timeline now
     lives in its own rule after the keyframes, with the selector repeated exactly:
     a `:where()` there has no specificity against the first rule, so the timeline
     stayed `auto` in the first attempt at splitting them.
  2. **Animating opacity fails the accessibility gate.** Starting a block at
     `opacity: 0.4` divides its contrast by roughly the same factor, and every tile
     below the fold was reported as unreadable — permanently so for a low-vision
     reader who never scrolls to it. The reveal moves; it does not fade.

  The existing `prefers-reduced-motion` block covers the hover lift, and the
  scroll-driven animation — whose progress is not time — gets `animation: none`
  explicitly.

- 362db72: Support translated pages, per-page language metadata and a header language switch.

  ## `@simple-site-generator/templates`
  - **A page can declare its own language.** `lang` in frontmatter (or in route
    meta) drives `og:locale`, the JSON-LD `inLanguage`, and `<html lang>`. Before
    this, a Dutch page on an English site announced itself as English — and a
    declared language beats a search engine's own detection, so the translation
    would never be indexed as one (and it failed WCAG 3.1.1).

  - **`alternates` emits an hreflang cluster.** Each entry becomes a
    `rel="alternate"` link plus `og:locale:alternate`. The list is emitted only
    when it names more than one language, so a single-language site does not point
    at itself.

  - **The header carries a language switch**, built from the current page's
    `alternates` and filtered to the pages a visitor can actually reach: on
    desktop as toolbar links, on small screens in the overflow menu. A page with
    no alternates renders no switch at all.

  - **`<html lang>` is written through the SSR context.** Quasar's Lang plugin
    owns that attribute — its Meta plugin filters `lang` and `dir` out of
    `htmlAttr` — so a page-level language has to be written where Quasar writes
    it. Doing that instead of swapping Quasar's language pack keeps the pack (and
    its whole string table) out of the client bundle, where it would have cost
    several kilobytes on _every_ page to fix one attribute. `withLang` is a pure
    function with tests, because the SSR path can only be exercised through a real
    prerender.

  ## Fixed
  - **Subpage menu links pointed at routes that do not exist.** The header linked
    a child as `/{parent}/{child}` while the router builds flat paths from page
    ids, so every dropdown item 404'd. Both the header and the drawer now use
    `pathOf`, the same helper the rest of the navigation uses.

  - **An action with an `href` kept its button styling.** `CtaButton` rendered
    `mailto:`/`tel:` destinations as a bare underlined anchor, so a page whose
    primary action was "email us" looked like a broken page. `q-btn` handles
    `href` itself and stays a real link.

  - **The page header illustration no longer tiles across the band.** The
    shortcut used `bg-no-repeat`/`bg-right`, which this preset does not define —
    an unmatched utility is dropped silently. The geometry now lives in
    `headerImageStyle`, with a gradient in the band's own colour so a long lede
    never reads across the artwork.

  - **`headerImage` (and the other new frontmatter) is declared on `SitePage`.**
    A field missing from the props type is never exposed as a prop, so the value
    landed in `attrs` and the band silently rendered without its illustration.

- 01474b6: Style the prose from the design system, not from a ported QMarkdown stylesheet.

  The templates render the HTML that `vite-plugin-markdown` produced at build time,
  so declaring the `qmarkdown` app extension only emitted ~10 KB of rules for a
  component nobody ships. Measured on the the reference site, dropping it changed
  **one** rendered property out of twenty-one: the link underline offset. Nothing
  else moved, because `ssg-prose` already sets the measure, the leading, heading
  sizes and margins, link colour and hover, images and blockquotes, and the rest is
  browser defaults.

  So the offset moved into that rule and the declaration is gone from the app
  template, which now declares only `qmediaplayer`. Apps that keep
  `appExtensions: ['qmarkdown']` are unaffected — it remains a valid style name.

  If a page ever needs code blocks and tables to look deliberate, that styling
  belongs in `ssg-prose` too, where it can be written for the design system instead
  of inherited from a port.

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

### Patch Changes

- ae27088: Give links in a plain-template table the theme's link colour.

  A link in a table cell is not prose, so it inherited nothing but the user
  agent's own `#0000ee`. On white that is 7.5:1 and every contrast audit passed it;
  on the dark surface it is **1.83:1**, found on a contact page as soon as
  the site began following the operating system's colour scheme.

  Tables are how the `plain` template shows contact details — phone, e-mail,
  address — so this was not a corner case: it was the one place an unstyled anchor
  was guaranteed to appear on every site built from this template.

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

- 666bb2b: Meet the WCAG 2.2 target-size minimum on footer links.

  A footer link is small text inside a tight list, so at `text-step--1` two
  adjacent links sat inside each other's 24px circle — enough for Lighthouse's
  `target-size` audit to fail a page at 96 accessibility, which the verification
  gate treats as a defect rather than a trade-off. The links now carry
  `min-h-[24px]`, and the seventh footer link that made it visible is a site
  detail, not the cause.

- 5a05cd8: Make the brand header readable in dark mode.

  Quasar matches the header with `.body--dark .q-layout__section--marginal` and
  paints it `--q-on-surface` — the colour of the _page_, not of a primary bar. The
  preflight that colours the header was equally specific, so the cascade decided
  against it: measured **1.32:1**, near-white text on bright green, with the nav
  links and the brand inheriting the same wrong colour.

  The selector now carries the `body` element, which outranks Quasar's rule in both
  modes without `!important`. Measured after the fix: header **7.67:1** in dark
  mode, **6.49:1** in light.

  The rest of dark mode was broken by a preset bug, not this template: QMarkdown's
  dark block painted body text with `--q-surface-container-low` (a surface role),
  so every heading, paragraph and list item resolved to the page colour —
  **1.00:1**, invisible. That is fixed in `unocss-preset-quasar` (BUG-085) and
  lands as 13.29:1 once the preset release carrying it is installed.

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

## 0.1.20

### Patch Changes

- 009e85e: Restore the hero image's accent-coloured shadow in `small-business-v2`.

  The avatar uses the template's own `avatar-border` class again, instead of the
  `shadow-lg shadow-accent` UnoCSS utilities. The colour in those utilities comes
  from the consumer's `vitrify.unocss` theme, so apps that do not configure it
  never generate `.shadow-accent` and the shadow disappeared.

## 0.1.19

### Patch Changes

- b9491bb: Restore the hero background gradient in `small-business-v2`. The hero uses the
  template's own `page-background` class again, instead of UnoCSS utilities that
  consumers without a `vitrify.unocss` config never generate, which left the
  landing page without a background.
- b9491bb: Modernize the toolchain: oxlint and oxfmt replace eslint and prettier, and
  everything moves to pnpm 12 and Node 20.19+, with dependencies updated (vite 8,
  vue 3.5.42, quasar 2.32, vitrify 0.28).

  Scaffolded projects now ship `.oxlintrc.json`/`.oxfmtrc.json` and the oxc VS
  Code extension instead of the eslint stack, pin TypeScript 6, and their deploy
  workflow uses the current GitHub Actions.

## 0.1.18

### Patch Changes

- 728294b: fix(templates): fix small-business template layout

## 0.1.17

### Patch Changes

- bcc48b4: fix(templates): fix routes for nested pages

## 0.1.16

### Patch Changes

- 5ef28d3: fix(templates): add margins to Landing photo

## 0.1.15

### Patch Changes

- 5355865: feat(templates): add instagram and facebook links to small-business-v2

## 0.1.14

### Patch Changes

- 434e4b3: fix(templates): fix layout icons

## 0.1.13

### Patch Changes

- 3d32e99: fix(templates): fix QPageScroller

## 0.1.12

### Patch Changes

- 9189f3b: chore: update templates

## 0.1.11

### Patch Changes

- 540e897: fix(templates): fix one-page layout and seo

## 0.1.10

### Patch Changes

- 07c8a28: chore(templates): update one-page
- aca0a6b: fix(templates): set fetchpriority high

## 0.1.9

### Patch Changes

- feb2326: chore: update templates

## 0.1.8

### Patch Changes

- d57c6d3: fix(templates): update templates

## 0.1.7

### Patch Changes

- 7ec70e2: feat(templates): add one-page template

## 0.1.6

### Patch Changes

- b08f0ce: chore: add copyright text

## 0.1.5

### Patch Changes

- df9b484: Update packages

## 0.1.4

### Patch Changes

- b20dd30: fix(templates): fix small-business LandingPage image height"
- 657fff8: chore: update dependencies

## 0.1.3

### Patch Changes

- a455612: chore(templates): update packages

## 0.1.2

### Patch Changes

- 0198cb9: fix(templates): add square to q-avatar
- a212e7f: fix(templates): fix icon parsing in templates

## 0.1.1

### Patch Changes

- 060240b: Update templates
