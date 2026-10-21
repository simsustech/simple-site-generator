---
'@simple-site-generator/templates': patch
---

Give links in a plain-template table the theme's link colour.

A link in a table cell is not prose, so it inherited nothing but the user
agent's own `#0000ee`. On white that is 7.5:1 and every contrast audit passed it;
on the dark surface it is **1.83:1**, found on the iseeyou contact page as soon as
the site began following the operating system's colour scheme.

Tables are how the `plain` template shows contact details — phone, e-mail,
address — so this was not a corner case: it was the one place an unstyled anchor
was guaranteed to appear on every site built from this template.
