---
'@simple-site-generator/templates': patch
---

Give a content list semantics its markup can support.

`ContentList` rendered a `q-list` — `role="list"` — with the list's heading as
its first child, and rendered every item that carries an `href` as an `<a>`, which
Quasar leaves with the implicit link role and no `listitem` role. A list of links
therefore had no `listitem` children at all, and the heading was an invalid child
besides. Lighthouse reports both as `aria-required-children`; measured on the contact
page of the first site whose lists are all links, at accessibility 95.

The heading is a sibling now, and the container is `role="group"` labelled through
`aria-labelledby` from that heading — a group allows a label and allows its
children to be links, so nothing is claimed that the markup does not have. The
items are untouched: giving them `listitem` would remove the link role, which is
worse than the violation.

`ssg verify` did not catch this: its Lighthouse pass covers one page, and the
contact page was not it. A site whose lists are entirely links is the case that
exposes it.
