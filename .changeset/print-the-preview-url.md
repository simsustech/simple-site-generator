---
'simple-site-generator': patch
---

Make a scaffolded site's preview print the URL it serves on.

`ssg init` wrote `pnpm run build && caddy run --config build/Caddyfile.preview …`
as the `preview` script, while the template shipped `scripts/preview.mjs` beside
it. Caddy prints no URL for a bare `:port` site block — only a JSON line carrying
`"addr":":8150"` — so the address was knowledge the reader had to carry. Worse,
Caddy binds with `reuseport`: two previews on one port both "succeed", and the
kernel hands each request to whichever process it likes, so one site's HTML
arrives with the other site's modules and the console reports a module that
"doesn't provide an export named …".

The generated `preview` script now runs `scripts/preview.mjs`, which prints
`Preview: http://localhost:<port>` before starting and passes that same port in.
`PREVIEW_PORT` still overrides both. The template's `build/Caddyfile.preview`
defaults to the same 8150 instead of 8095, so a direct `caddy run` binds what the
script would have printed — and 8095 is what a crowd of other Caddyfiles here
defaults to, which is how the two previews ended up sharing it.

The scaffold test asserts the pair: the script is wired, and the Caddyfile's
default port is the one the script prints.
