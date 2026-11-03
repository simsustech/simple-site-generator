---
'simple-site-generator': patch
---

Write a site name with an ampersand as itself, not as an HTML entity.

`ssg init` renders the scaffold through Handlebars, and the double-brace form
escapes for HTML. That is right for `build/Caddyfile` and the deploy workflow and
wrong for every value that lands inside a JavaScript string: a site named
a display name containing `&` was written into `vitrify.config.ts` as its HTML
entity (`&amp;` instead of `&`),
which then renders as `&amp;amp;` in `<title>` and puts an escaped name into the
JSON-LD, the OpenGraph tags and the sitemap. Measured on a site scaffolded from
this kit, and fixed there by hand before this.

The three affected values (`title`, `url`, `description`) now travel to the
template already quoted as JavaScript string literals (`JSON.stringify` in
`init.ts`) and are inserted raw, so quotes and ampersands survive as themselves.
A quote in a site name is the same bug seen from the other side, and it would have
produced a config file that does not parse.


