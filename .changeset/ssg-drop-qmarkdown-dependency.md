---
'simple-site-generator': patch
'@simple-site-generator/templates': patch
---

Drop the `@quasar/quasar-ui-qmarkdown` dependency.

The templates render the HTML that `vite-plugin-markdown` produced at build time,
so nothing imports the component any more: it was still installed by every
consumer, and every project `ssg init` scaffolded, for a package nothing used.

The prose styles do not come from that package. They come from the preset's
ported selectors — which the app declares by name with `appExtensions:
['qmarkdown']` — plus the design system's own prose rules and the browser
defaults. Measured on the simsustech site, removing the declaration too would
drop ~10 KB of raw CSS and change exactly one rendered property (the link
underline offset), since those pages use no code blocks and no tables.

`@quasar/quasar-ui-qmediaplayer` stays: the templates still lazily load the
player for pages with video.
