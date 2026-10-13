---
'@simple-site-generator/templates': patch
---

Meet the WCAG 2.2 target-size minimum on footer links.

A footer link is small text inside a tight list, so at `text-step--1` two
adjacent links sat inside each other's 24px circle — enough for Lighthouse's
`target-size` audit to fail a page at 96 accessibility, which the verification
gate treats as a defect rather than a trade-off. The links now carry
`min-h-[24px]`, and the seventh footer link that made it visible is a site
detail, not the cause.
