---
'simple-site-generator': patch
---

Derive the scaffold's kit pins from the CLI's own version.

`ssg init` wrote `@simple-site-generator/templates` and `simple-site-generator` as a typed constant, so
every release left it behind — at one point the manifest said 0.4.1 while the constant still said
`^0.4.0`, and scaffolds pinned a kit the CLI itself no longer matched. The pin is now read from this
package's manifest, so `changeset version` moves it with the release.

The two packages are one `fixed` group, so a single version serves both, and the CLI test asserts that
invariant plus the matching pins instead of comparing a hand-typed string with a managed version.
