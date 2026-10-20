---
'simple-site-generator': minor
'@simple-site-generator/templates': minor
---

A document title that names the site first, and a page that can opt out of it.

**Page titles name the site first.** `<title>` was `<page> · <site>`; it is now
`<site> | <page>` — `simsustech | Contact`. A tab, a bookmark and a search
result are all places a page appears with no surrounding context, and the site
name is the part that has to survive truncation.

**A page can declare its own document title.** `headTitle` replaces the title
outright, suffix and all:

```yaml
title: Simple, sustainable technology for professionals # the <h1>
headTitle: simsustech # the document title
```

The suffix exists to name the site _inside_ a page's title. The front page _is_
the site, so there the rule produces `simsustech | simsustech`. `headTitle` is
how that exception is declared — on the page — rather than guessed by the SEO
layer from `id: home`, which a multilingual site does not use for its second
front page (the Dutch one is `nl`). `og:title`, `twitter:title` and the
`WebPage` JSON-LD entity follow it, so a page never states two different names
for itself.
