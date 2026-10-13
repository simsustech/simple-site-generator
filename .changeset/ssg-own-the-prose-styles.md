---
'@simple-site-generator/templates': minor
---

Style the prose from the design system, not from a ported QMarkdown stylesheet.

The templates render the HTML that `vite-plugin-markdown` produced at build time,
so declaring the `qmarkdown` app extension only emitted ~10 KB of rules for a
component nobody ships. Measured on the simsustech site, dropping it changed
**one** rendered property out of twenty-one: the link underline offset. Nothing
else moved, because `ssg-prose` already sets the measure, the leading, heading
sizes and margins, link colour and hover, images and blockquotes, and the rest is
browser defaults.

So the offset moved into that rule and the declaration is gone from the app
template, which now declares only `qmediaplayer`. Apps that keep
`appExtensions: ['qmarkdown']` are unaffected — it remains a valid style name.

If a page ever needs code blocks and tables to look deliberate, that styling
belongs in `ssg-prose` too, where it can be written for the design system instead
of inherited from a port.
