---
'@simple-site-generator/templates': minor
'simple-site-generator': minor
---

Add a fourth template, `plain`, and reduce colour to a single source.

`plain` is the sober template for a local business with one service and one
action. The page opens with the price and the CTA, then the four steps, then the
prose — the site it was written for ended every page in "vraag een offerte aan"
and never named a number. Its styling lives in `design.ts` as `ssg-plain__*`
shortcuts beside `ssg-business__*`, so it inherits the type scale, the 8-point
rhythm and the MD3 role tokens, and a missing class is a failure in `ssg verify`
rather than a drift nobody sees.

Colour now has exactly one input. The scaffolds used to pass both a nine-entry
`colors` map and a `sourceColor`; only the second was read, and the first was
spread into the UnoCSS theme where it produced utilities that disagreed with the
templates' own role tokens. `ssg init` no longer writes a `colors` block, the
theme is `ssgUnoConfig.theme` whole, and the package exports `ssgSourceColor` as
the default a new site starts from.

The header also gained two guarded chrome elements the plain template asks for:
the phone number and the client-login link, both read from `extra` and both
rendered only when set. The login is marked external, opens in a new tab, and
moves into the overflow menu on a narrow screen.
