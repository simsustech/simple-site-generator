---
'simple-site-generator': patch
---

Answer 404 for a missing page instead of serving a file with a 200.

The generated Caddyfile ended `try_files` with `/index.html`:

```
try_files {path}.html {path} /index.html
```

so **every mistyped URL returned the home page with status 200.** Google indexes
that as a real page — one URL per typo, all duplicates of the home page — and
uptime monitoring sees success where a visitor saw the wrong page. A `/404.html`
fallback is no better: the status is still 200.

Both containers now answer a real 404 and still show the site's own error page:

```
try_files {path}.html {path}
file_server
# ...
handle_errors {
	root * /srv/{{ url }}
	@notFound expression {err.status_code} == 404
	rewrite @notFound /404.html
	file_server
}
```

Verified against a built site: `/website` 200, a missing page 404 with the
generated error page as the body, a real asset 200, a missing asset 404.
