---
'@simple-site-generator/templates': minor
---

Stop shipping a Markdown parser to the browser.

`vite-plugin-markdown` already renders each page's Markdown at build time, so the
page module carries **HTML**. `PageContent` then handed that HTML to `QMarkdown`,
which parsed it again on the client — which meant every visitor downloaded
markdown-it (`mdurl`, `linkify`, `uc.micro` and friends) so the browser could
redo work the build had finished.

It now renders the HTML directly, inside the `q-markdown` class the preset's
ported Markdown styles select, so nothing about the typography changes. Measured
on the simsustech site: the vendor chunk went from **142.7 KB to 78.5 KB gzipped**
and total client JavaScript from 249 KB to 184 KB, with Lighthouse performance
83 → 86 and accessibility/SEO/best-practices unchanged at 100.

`demoteHeadings` keeps its Markdown semantics and gains `demoteH1` for the HTML
path. The two differ on purpose: with Markdown input an author's `#` is the
usual start, so the whole outline shifts; with HTML only a stray `h1` is a
defect, and shifting everything would take a `##` to `h3` and skip a level.

`test/bundle-split.test.ts` now asserts no chunk in the package contains a
Markdown parser, which is the assertion that fails if this regresses.
