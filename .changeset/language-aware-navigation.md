---
'@simple-site-generator/templates': minor
---

The navigation follows the page's language, not the site's default.

`tags` decided *which* nav surface a page appears in, but nothing decided *whose* — so on a site
serving `nl/` pages, a Dutch page's header showed the English menu: `Services` leading to
`/services`, and no Dutch page reachable from the menu at all. Only the language switch led anywhere.

`SitePage.lang` (optional, and already carried by every route's meta) is now matched against the
language of the page being viewed, in the menu, the contact dropdown, the mobile drawer and the
footer:

```yaml
# nl/Services/Services.md
label: Diensten
tags: [menu]
lang: nl
```

A page that declares no `lang` is neutral and stays in every menu, so a single-language site — which
declares none anywhere — gets exactly the menu it had. A route that declares none (the 404 page is
one file serving every language) falls back to the site's own language.
