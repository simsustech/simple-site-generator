---
'@simple-site-generator/templates': minor
---

The card band's heading is a label the site owns, not a string in the template.

Both card bands — the business template's and the landing template's — are headed
`Services` in English. The landing template already took the word from
`extra.cardsHeading`; the business template hardcoded it. It now reads the same
key, falling back to that same English word, so a site can name the band in its
own language:

```ts
extra: { cardsHeading: 'Diensten' }
```

It deliberately stays out of frontmatter: the heading names the band, not the
page, so the frontmatter alternative is the same word typed into every page that
shows cards. `extra` is site-wide, so a site whose pages are not all in one
language resolves the right word per page in its route table — which is what the
simsustech site does.
