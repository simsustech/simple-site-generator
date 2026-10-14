# ADR-0004 — Verification is two tiers, and only the deterministic one blocks

**Status:** accepted

## Context

`ssg verify` exists to make a broken or slow site fail before it is deployed. What
"fail" should mean is not obvious, and getting it wrong makes the gate useless in
a specific, well-understood way.

Two facts shaped this:

- **Lighthouse performance varies with the measuring machine.** It simulates
  throttling and depends on what else is running. A gate that fails randomly gets
  switched off by the people it blocks — after which it protects nothing. A gate
  nobody trusts is worse than no gate, because it looks like coverage.
- **Lighthouse's `resource-summary` audit reports `transferSize: 0` when its trace
  captures no network activity** — reproduced in a sandboxed Chromium. A byte
  budget read from it therefore reports "OK" while measuring nothing. A budget
  that cannot fail is not a budget.

Both failures are the same shape: the check reports success for a reason
unrelated to the thing it is checking. This repository has met that shape before
(ADR-0001) and treats it as the enemy.

## Decision

Two tiers, with different consequences.

**Hard failures — deterministic only.** These block:

- the SEO surface of every built page: exactly one `<title>`, one absolute
  canonical on the configured origin, a description, parseable JSON-LD, exactly
  one `<h1>`, `lang` on `<html>`;
- gzipped byte budgets (**JS ≤ 250 KB, CSS ≤ 60 KB**), measured **from the built
  files on disk**, not from Lighthouse;
- markup ↔ stylesheet coverage: every `ssg-*` class a page uses must be styled by
  the built CSS, or be listed as a by-design hook. A class the design system lost
  is a defect that no other part of the toolchain can see (ADR-0003).

**Warnings — machine-dependent.** These inform:

- Lighthouse **performance**, with a threshold rather than an equality;
- a near-budget notice when measured bytes come within 10% of a ceiling, so a
  budget with no headroom is visible on every run rather than only when it fails.

**Exact scores where a lower score is a defect, not a trade-off.**
Accessibility, best-practices and SEO must be exactly **100**. There is no reason
to ship a site with an accessibility defect, so there is no threshold to tune.

## Consequences

- A performance regression does not block a merge. That is the accepted cost of a
  trustworthy gate, and it is why the near-budget warning exists: performance
  signal has to come from somewhere that does not cry wolf.
- Budgets are measured after the build, so `--no-lighthouse` runs the whole
  deterministic half in seconds with no browser.
- Anything machine-dependent must **not** join the hard tier. The reverse also
  holds: a new check that is deterministic belongs there rather than as a warning.
  The markup ↔ stylesheet check was added on exactly that reasoning — it is a set
  difference over two files the build already wrote.
- Byte budgets are gzipped, because that is what crosses the network, and the
  refusal to report a pass on an all-zero measurement is deliberate: zero means
  the measurement failed, not that the site is free.

## Alternatives considered

- **Everything through Lighthouse** — rejected twice over: non-deterministic
  scores, and the zero-transfer trap that makes a budget unenforceable.
- **Making all four Lighthouse categories hard failures** — rejected: it makes
  the whole gate flaky for one category that is genuinely noisy.
- **Byte budgets as warnings** — rejected: the sizes are exact and reproducible
  from disk, so there is nothing to be uncertain about.
- **No byte gate at all** — rejected: transfer size is a product feature here, and
  an unmeasured budget is the failure mode above.
- **Thresholds for accessibility/SEO** — rejected: below 100 is a defect to fix,
  not a dial to set.
