---
'simple-site-generator': patch
---

Stop a scaffolded site from serving its own Caddyfile.

The scaffold copies `build/Caddyfile` into `dist/static/` — that is how the file
reaches the server, which imports it from the web root — so `GET /Caddyfile`
returned the entire configuration, comments about the server included, on every
site created from this kit. Both `file_server` blocks now `hide Caddyfile`, in
`build/Caddyfile.hbs` and in `build/Caddyfile.preview`, which serves the same
artifact locally.

The argument is a file name, not a path: `hide /Caddyfile` validates and then does
nothing at all. Measured against a running Caddy 2.11 — `hide Caddyfile` answers
404, `hide /Caddyfile` answers 200. The scaffold test asserts over directives
rather than raw text, because the comment that explains this names both forms.
