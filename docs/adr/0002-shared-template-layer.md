# ADR-0002 — Three template modules over one shared layer

**Status:** accepted

## Context

The templates package shipped five templates: `documentation`, `one-page`, `personal`, `small-business`
and `small-business-v2`. They were independent copies of the same layout — header, drawer, footer,
scroll-to-top, logo, social links, dark-mode toggle — differing mainly in which pieces each had bothered
to add.

The consequences were concrete:

- A fix had to be applied five times, and drifted. The same accessibility defect (an icon-only button
  with no accessible name) existed in every copy; fixing it in one left four broken.
- Two of the templates (`one-page`, `personal`) were near-duplicates of `small-business` and had already
  diverged in ways nobody intended.
- The generated app renders exactly one template at a time, so four of the five were dead weight in
  every project — but all five were maintained.

## Decision

Curate to **three** template modules — `docs`, `landing`, `business` — composed from **one shared
layer**.

`packages/templates/src/shared/` owns everything that was duplicated: `SiteShell` (header, drawer,
footer, skip link, scroll-to-top), `Hero`, `BentoGrid`, `ProofSection`, `FaqList`, `Breadcrumbs`,
`CtaButton`, `ProofStrip`, `PageContent`, `StickyCta`, and the pure helpers `nav.ts`
(which pages are in the menu, subpage resolution) and `headings.ts` (markdown heading demotion).

The three modules are thin compositions. A module may differ in _which_ sections it composes and in its
own styles; it must not re-implement the shell.

Navigation logic lives in `nav.ts` as pure functions rather than inline in components, because Quasar's
`q-menu` does not render its contents until it is opened — asserting on a dropdown's HTML is impossible,
while asserting on resolution rules is trivial.

## Consequences

- `landing` and `business` inherit the shell, so an accessibility or contrast fix lands everywhere at
  once. This was verified: the step that introduced the shared shell fixed the icon-button and skip-link
  defects for every template simultaneously.
- Deleting two templates is a **breaking change** for anyone importing them by name. Released as a
  `minor` on a 0.x package, and documented in the changeset and README migration note.
- A module that needs to diverge genuinely must extend the shared layer rather than fork it. If a fourth
  template is ever needed, the question to ask first is which shared component is missing.
- The shared layer is the reason the whole kit can ship design tokens and accessibility as a
  _guarantee_ rather than as a checklist item.

## Alternatives considered

- **Keep five independent templates** — the status quo; every fix multiplies by five and drifts.
- **One template with feature flags** — reduces duplication but makes every template carry the union of
  all features, which conflicts directly with the byte budgets.
- **Publish the shared layer as a separate package** — considered, but the templates package is already
  the natural home; a separate package would add a version to coordinate for no isolation benefit, since
  the templates are versioned and released together anyway.
