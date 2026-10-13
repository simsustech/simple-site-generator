---
'simple-site-generator': minor
'@simple-site-generator/templates': minor
---

A principles band, a prose column that fits its illustrations, and a hero graphic
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
