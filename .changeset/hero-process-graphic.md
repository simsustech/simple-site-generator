---
'simple-site-generator': minor
'@simple-site-generator/templates': minor
---

Add the hero process graphic, and give the business template a hero to hang it on.

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
