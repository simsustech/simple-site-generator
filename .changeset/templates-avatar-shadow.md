---
'@simple-site-generator/templates': patch
---

Restore the hero image's accent-coloured shadow in `small-business-v2`.

The avatar uses the template's own `avatar-border` class again, instead of the
`shadow-lg shadow-accent` UnoCSS utilities. The colour in those utilities comes
from the consumer's `vitrify.unocss` theme, so apps that do not configure it
(such as hvbnicky) never generate `.shadow-accent` and the shadow disappeared.
