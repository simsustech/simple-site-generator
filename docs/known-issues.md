# Known issues

Defects and constraints that are real, understood, and **not fixed here**. Each
one records what is known, what was measured, and what a fix would require — so
the next person does not have to rediscover it. Anything that turns out to be
fixable in this repository should be fixed rather than listed.

Kept separate from `CONTEXT.md` on purpose: that document describes how the kit
works, and a constraint buried in a prose section is a constraint nobody tracks.

---

## KI-1 — The JavaScript budget has little headroom

**Status:** open. **Impact:** the byte gate can fail on a dependency bump.

`ssg verify` fails hard when transferred JavaScript exceeds 250 KB gzipped. The
reference site (`simsustech/website`, the `business` template) measures
**192.6 KB — 77% of the budget**. Quasar's runtime dominates it: `vendor.mjs`
85 KB and `quasar.mjs` 58 KB of the 192.6.

**`CONTEXT.md` used to claim the docs template measured ~248 KB of 250 KB, and
that figure should not be trusted.** It was measured while markdown-it was on the
client path; that is no longer true (see KI-2's resolution note), so the number
predates a change that removed most of a bundle. Re-measure the docs template
before using any figure here to justify a decision.

**A fix would require** either a smaller Quasar footprint (not available — the
components are the product), or accepting a higher ceiling with a documented
reason. What is _not_ a fix: silently raising the budget.

**What has been done:** `ssg verify` now warns when measured bytes come within
10% of the ceiling, so "no headroom" is visible on every run instead of only at
the moment it fails. A budget you are always near is a cliff; a warning turns it
into a signal.

---

## KI-2 — `vitrify.chunks` cannot move a large dependency off the eager path

**Status:** latent. **Impact:** a dependency that should be lazy cannot be made
lazy from the app.

Vitrify's built-in `vendor` chunk group matches all of `node_modules` and takes
precedence over an app-defined group in the Rolldown version in use. The practical
consequence recorded here was that `markdown-it` could not be moved out of the
eager `vendor` chunk no matter how the app grouped it — `vitrify.chunks` has no
effect on the client bundle.

**Resolution note:** the symptom is gone, but not by fixing this. Markdown is
rendered at build time by `vite-plugin-markdown` and injected as HTML, so no
markdown parser ships to the client at all any more; the templates package
removed `@quasar/quasar-ui-qmarkdown` with it, and `bundle-split.test.ts` asserts
that no chunk contains `markdown-it`. The underlying chunk-group precedence is
unchanged and will bite again for the next large dependency.

**A fix belongs in vitrify, not here.** An app-level workaround would fork the
build pipeline from the one the dev server uses, which is the reason `ssg build`
is a thin wrapper in the first place.

---

## KI-3 — Nothing type-checks the app template

**Status:** open by design, with a real cost. **Impact:** a mistake in
`templates/app/` is invisible until a generated site is built.

`packages/simple-site-generator/templates/app/` has no `node_modules` and is in
no `tsconfig` include: it is rendered into a project that installs its own
dependencies. `ssg check` validates page _content_, not this code.

The cost is concrete. While making the router fail loudly on an unknown `page:`
(see ADR-0004's sibling change), an edit to `templates/app/src/router/routes.ts`
deleted an arrow function's opening line and its early return, and **nothing
reported it** — `tsc`, `oxlint`, `oxfmt` and 172 tests were all green, because
none of them look at that file. It was caught by rebuilding the reference site.

**A fix would require** generating a throwaway site in CI and type-checking it.
That is a real test-runner addition, not a config tweak, which is why it is
recorded rather than done.
