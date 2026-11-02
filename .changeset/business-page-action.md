---
"@simple-site-generator/templates": patch
---

Render a page's `cta` in the business template.

`cta` was a dead field there. The band used to render it beside the title; when the band was cut
back to a title and a decoration, the action went with it, and every page that declared one kept
declaring it into nothing — the reference site's contact page ended up with no action at all, after
its quick-pick list was removed and the prose's link was the only way left to write to it.

The action closes the page instead, after the prose and the cards it belongs to, where a reader who
has just been convinced needs it. `href` carries `mailto:` and `tel:` as well as `route` carries an
in-app path, so a contact page can ask for the email without a form. It is still not in the band: an
action repeated above the fold on every page is what made that block the loudest on ten pages in a
row.
