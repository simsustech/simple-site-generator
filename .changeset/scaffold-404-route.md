---
'simple-site-generator': patch
---

Write `404.html` for a scaffolded site, and ship the guard that checks it.

The scaffolded `build/Caddyfile` rewrites a missing URL to `/404.html`, and
nothing ever created that file: the prerenderer writes one HTML file per concrete
route `path`, and the router's only error route was the `:catchAll(.*)*` pattern.
Every site built from this kit therefore answered a mistyped URL with status 404
and an **empty body** — measured on two of them, 0 bytes.

The scaffold's router now carries an explicit `404` route beside the catch-all,
with the same component and a shared `notFoundMeta` that includes a `description`.
That last field is not optional: `ssg verify` requires one on every built HTML
file, so the new route fails the build without it — which is how the gap was
found.

The scaffold also ships `test/caddyfile.test.ts`, the guard every patched site
grew by hand: `hide Caddyfile` in each `file_server` and never with a leading
slash, a base64url hash class of exactly eight characters, and the `/404.html`
rewrite. Until now a freshly generated project had no test file at all, so its own
`pnpm test` exited non-zero on "no tests found" — read as a broken scaffold.


