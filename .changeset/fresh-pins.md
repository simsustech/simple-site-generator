---
'simple-site-generator': patch
---

Pin a scaffolded project to the kit and vitrify releases that ship it.

The dependency map behind `ssg init` pinned `@simple-site-generator/templates` and
`simple-site-generator` to `^0.2.0`, and `vitrify` to `^0.30.0`. A caret on a `0.x`
version does **not** float to the newest release — `^0.2.0` means `>=0.2.0 <0.3.0`
— so a site scaffolded the day after 0.4.0 shipped installed kit 0.2.0: retired
template names, the pre-hashing bundler, and none of the fixes. The scaffold looked
current and produced a project two releases old.

Now `^0.4.0` and `^0.32.0`, and `tests/cli/init-templates.spec.ts` asserts each
pin against the version in this workspace, so a release that forgets them fails the
CLI suite instead of quietly scaffolding a stale site again. The templates package's
own `vitrify` dev-dependency moves to `^0.32.0` with it, so the version the kit is
developed against is the version a new site receives.


