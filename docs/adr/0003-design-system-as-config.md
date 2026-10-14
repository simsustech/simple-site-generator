# ADR-0003 — The design system is UnoCSS configuration, not a stylesheet

**Status:** accepted

## Context

Three templates and every generated site share one visual language: a type and
spacing scale, a colour system, and a set of component classes. It has to be
shared, because before it was, five near-identical templates each carried their
own styling and every fix had to be applied five times (ADR-0002).

The first attempt at sharing it was a **stylesheet**. `design/tokens.css` held
the scale as custom properties, and the build extracted it into a separate file.

It failed, and it failed invisibly in the way this repository keeps running into:

- The consumer never imported the extracted file. Nothing reported that, because
  nothing can: a stylesheet that is built and not linked is indistinguishable
  from one that is linked.
- Every `var(--ssg-*)` therefore resolved to nothing. The site rendered
  **unstyled in both development and production**.
- The byte budget was _satisfied_. The CSS that should have been there was
  absent, and absent is small.

A design system whose failure mode is "renders, but wrong" is worse than one that
fails to build, because the symptom is attributed to the change that was being
made rather than to the styling.

## Decision

The design system is an **exported UnoCSS configuration**. `src/design.ts`
exports `ssgTheme` (the scale as theme entries, producing utilities like
`text-step-3` and `py-space-5`), `ssgShortcuts` (the recurring compositions, so
markup keeps readable `ssg-*` names), `ssgPreflights` (the handful of rules no
utility can express — element scopes, `:focus`, media queries) and `ssgSafelist`.
The app merges them into `vitrify.unocss` beside `unocss-preset-quasar`.

Two properties are deliberate:

- **No stylesheet exists.** The templates package builds no CSS at all and has no
  CSS export. Earlier it did, and every generated site shipped it — the UnoCSS
  scanner's leavings (`.outline`, `.grid`, and `.h1 { height: .25rem }` read out
  of `<h1>` tag names), imported through `globalCss`. That was removed.
- **Values come from the preset, not from here.** Colour, elevation and radii are
  read from the MD3 role tokens `unocss-preset-quasar` publishes
  (`--q-primary`, `--q-surface-container*`, `--q-outline-variant`). The app sets
  one `sourceColour` and the whole template re-themes, dark mode included, because
  those tokens switch with `body--dark`.

## Consequences

- **A consumer must merge the configuration.** There is no stylesheet fallback, so
  a site that does not merge it renders unstyled — not subtly. This really
  happened while the model changed: the templates changelog records a hero losing
  its background because it used utilities "consumers without a `vitrify.unocss`
  config never generate". `MIGRATING.md` exists largely because of this.
- **Class names are an interface.** A class in markup whose shortcut or preflight
  fails to emit produces no CSS and no error anywhere else in the toolchain:
  TypeScript sees a string, the linter sees a string, and the build succeeds. Four
  distinct silent failures have been observed this way — a shortcut array losing
  its separating comma (which parses as a computed member access and drops the
  _next_ entry), a stray backtick ending a preflight template literal early, a
  field omitted from `types.ts` so it never becomes a prop, and two classes
  setting the same property resolved by stylesheet order.
  Guarded by, in order of value: the markup ↔ stylesheet coverage check in
  `ssg verify` (ADR-0004), the safelist, a text-level test over the preflight
  literals, assertions on the shortcut table's shape, and a blocklist for
  `h1`–`h6`.
- **The safelist must be maintained.** It exists because Vite splits the shared
  components into their own chunks, so the consumer's content scan does not always
  see their classes. It is derived from the shortcut list, so it cannot drift from
  it.
- No CSS file means no `globalCss`, no import order to get wrong, and no
  stylesheet to keep in sync with the markup.

## Alternatives considered

- **A `tokens.css` stylesheet** — the original. Failed silently in both
  environments; see above.
- **Per-component `<style>` blocks** — would fight Quasar's own theming, duplicate
  the preset's MD3 token derivation, and reintroduce one copy of each token per
  component.
- **A Tailwind configuration** — would duplicate what `unocss-preset-quasar`
  already does, and the templates target Quasar's MD3 role tokens specifically.
- **A Vue plugin that injects styles at runtime** — moves CSS into JavaScript,
  which the byte budgets measure and the visitor pays for.
