/**
 * Markup ↔ stylesheet coverage.
 *
 * The kit's design system is UnoCSS configuration: `ssg-*` classes in markup
 * resolve to shortcuts and preflights that are generated at build time. Nothing
 * connects the two, and every failure in that gap is **silent** — which is the
 * class of defect this repository keeps meeting (see `docs/adr/0001` and
 * `docs/adr/0004`).
 *
 * The concrete case that motivated this: a shortcut array in `design.ts` lost
 * its separating comma, which parses as a computed member access. The entry
 * *after* the comma survived, the entry before it vanished, and
 * `tsc`, `oxlint` and the whole test suite stayed green while the class it named
 * rendered unstyled. It happened twice in one afternoon — `ssg-business__band-demo`
 * and then `ssg-proof-section__heading` — and was caught both times only by
 * looking at the page.
 *
 * This is the check that would have caught it mechanically. It compares what the
 * built HTML *asks for* against what the built CSS *provides*, which is a set
 * difference over two files the build has already written.
 */

/**
 * `ssg-*` classes that carry no styling by design.
 *
 * These are hooks: targets for tests and for `data-ssg`-style selection, or
 * structural markers a component uses to find its own nodes. They must be listed
 * rather than merely tolerated, because "this class has no rule" should be a
 * decision someone made, not an accident — which is the whole point of the check.
 *
 * Only `ssg-*` classes are checked at all. Third-party classes are out of scope
 * on purpose: Quasar adds state classes at runtime (`q-btn--active`, `body--dark`)
 * that are legitimately absent from the prerendered sheet.
 */
export const UNSTYLED_HOOKS: readonly string[] = [
  'ssg-breadcrumbs__sep',
  'ssg-content',
  'ssg-content__carousel',
  'ssg-content__markdown',
  'ssg-cta',
  // The demo's grid and per-stop group carry SVG presentation attributes (`fill`,
  // `mask`) rather than CSS, and the group is only a wrapper: its children are
  // what is styled. Both are selection hooks for the component's own tests.
  'ssg-demo__grid',
  'ssg-demo__stop',
  'ssg-header__language',
  'ssg-header__menu-toggle',
  'ssg-landing',
  'ssg-primary-navigation',
  'ssg-proof-section__facts',
  'ssg-proof-section__reviews',
  'ssg-proof__text'
]

/** Class tokens a document asks for. */
export function collectMarkupClasses(html: string): Set<string> {
  // Comments and scripts first. The SEO surface check learned this the hard way:
  // it counted tags inside an HTML comment, so a page whose head was entirely
  // commented out passed. The same trap applies here, and a JSON-LD block is a
  // script whose content is not markup either.
  const markup = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')

  const classes = new Set<string>()

  for (const match of markup.matchAll(/\bclass\s*=\s*"([^"]*)"/gi)) {
    for (const token of match[1].split(/\s+/)) {
      if (token) classes.add(token)
    }
  }

  return classes
}

/**
 * Class names a stylesheet mentions.
 *
 * The whole sheet is scanned rather than just its selector text. An earlier
 * version stripped declaration blocks first to be precise about it, and was
 * wrong: stripping innermost blocks turns `@media(...){.a{color:red}}` into
 * `@media(...){.a}`, and the next pass then strips `{.a}` — deleting the very
 * selector it was looking for. It reported a styled class as unstyled, which is
 * the one direction that would get a check like this switched off.
 *
 * Scanning everything is safe here because the check only asks about `ssg-*`
 * names, and generated CSS contains those in selectors and nowhere else. A
 * declaration value cannot produce one, and UnoCSS emits no comments.
 */
export function collectCssClasses(css: string): Set<string> {
  const classes = new Set<string>()

  for (const match of css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
    classes.add(match[1])
  }

  return classes
}

export interface ClassCoverageIssue {
  page: string
  className: string
}

/**
 * `ssg-*` classes that a page asks for and the stylesheet does not provide.
 *
 * Reported per page rather than as a flat list: which page uses an unstyled class
 * is the first thing needed to find it.
 */
export function checkClassCoverage(
  pages: { page: string; html: string }[],
  css: string,
  hooks: readonly string[] = UNSTYLED_HOOKS
): ClassCoverageIssue[] {
  const provided = collectCssClasses(css)
  const exempt = new Set(hooks)
  const issues: ClassCoverageIssue[] = []

  for (const { page, html } of pages) {
    for (const className of collectMarkupClasses(html)) {
      if (!className.startsWith('ssg-')) continue
      if (exempt.has(className)) continue
      if (provided.has(className)) continue

      issues.push({ page, className })
    }
  }

  return issues
}
