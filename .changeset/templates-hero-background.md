---
'@simple-site-generator/templates': patch
---

Restore the hero background gradient in `small-business-v2`. The hero uses the
template's own `page-background` class again, instead of UnoCSS utilities that
consumers without a `vitrify.unocss` config never generate, which left the
landing page without a background.
