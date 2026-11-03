---
'@simple-site-generator/templates': minor
---

Let a site name its builder in the copyright line.

The footer's legal line read `© <year> <title>`, which names the business. A site whose *builder* holds
the copyright — `© simsustech`, which is what several of these sites printed before they moved onto the
kit — had nowhere to say it, because `title` is the trade name the header already shows, and adding a
second `credit` line underneath is not the same sentence: it says "built by", not "©".

`extra.legal` now replaces the whole line. Absent or blank, the default stands, so nothing changes for a
site that does not set it.
