---
"simple-site-generator": patch
---

Stop writing a private-registry `.npmrc` into the generated deploy workflow.

`ssg init` emitted a step that wrote `@simsustech:registry=https://npm.simsus.tech` with a
`SIMSUSTECH_NPM_TOKEN` secret, plus a step that deleted it again. The kit is published on the public
npm registry, so a generated project needs neither — and a deploy that requires a secret it does not
use fails for the wrong reason the day the secret is missing or rotated. Both sites had already
shipped around it.

The workflow now has five steps: checkout, pnpm, node, install and build, rsync.

The kit's own release workflow carried the same dead line: both packages pin
`publishConfig.registry` to `registry.npmjs.org`, the lockfile has no private resolution, and no
package depends on the `@simsustech` scope. That token is gone from the publish path too; `NPM_TOKEN`
stays.
