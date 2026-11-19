---
'simple-site-generator': minor
'@simple-site-generator/templates': minor
---

feat: `ssg generate-icons`, and a header mark that is separate from the favicon

A site ships three pictures of the same mark — the tab icon, the ICO a legacy Windows shell asks for,
and the picture the header draws — and until now every project produced them by hand. Hand-made icons
drift silently: the logo is traced again, the 96 px PNG keeps showing the old artwork, and the only
place that shows it is somebody's bookmark bar.

`ssg generate-icons` renders all of them from one SVG (`logo.svg`, or `--input`) into `public/`, and
`ssg init` scaffolds it as `pnpm run generate:icons`. Rasterising stays icon-gen's job: it renders
through sharp's librsvg, which is what keeps a gradient and a clip-path alive at 16 px.

Two rules the command encodes, both learnt the hard way: the favicon stays a **PNG/ICO** — a
`rel="icon"` pointing at an SVG is ignored by most browsers, and the tab then shows a blank page
icon — and the header gets its **own** prop. `LayoutProps.logo` is the mark the header draws; the
header falls back to `favicon` when a site sets only that, so nothing regressed.
