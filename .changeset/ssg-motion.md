---
'@simple-site-generator/templates': minor
---

Two CSS-only motion touches, and the two traps they exposed.

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
