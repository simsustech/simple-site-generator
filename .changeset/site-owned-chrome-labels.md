---
'@simple-site-generator/templates': minor
---

Let the site name the two chrome controls, and stop hardcoding English in them.

The header's theme switch and customer login were the only strings in the shared
chrome that were not the site's own — every other label comes from a page's
`tags`. On a Dutch site that read as a template left half-translated: a menu
offering "Dark mode" and "Client login" under a Dutch nav.

`extra.labels` now carries them, the same way `extra.cardsHeading` carries the
card band's heading, with the English words kept as the fallback:

```ts
extra: {
  labels: { dark: 'Donker', light: 'Licht', clientLogin: 'Klant login' }
}
```

The theme switch continues to name the *action* rather than the state: "Donker"
while the page is light is the thing a visitor is looking for.

**`ProofStrip` speaks the page's language too.** It printed `4.9/5 from 45
reviews` for everyone, so a Dutch page showed a decimal point where Dutch writes
a comma — one of the small tells that a page was assembled rather than written.
It now takes `lang` (fed to `Intl.NumberFormat`) plus the two words around the
count, defaulting to the old English rendering so no existing site changes.
