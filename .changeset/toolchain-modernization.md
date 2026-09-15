---
'create-simple-site-generator': minor
'simple-site-generator': patch
'@simple-site-generator/templates': patch
---

Modernize the toolchain: oxlint and oxfmt replace eslint and prettier, and
everything moves to pnpm 12 and Node 20.19+, with dependencies updated (vite 8,
vue 3.5.42, quasar 2.32, vitrify 0.28).

Scaffolded projects now ship `.oxlintrc.json`/`.oxfmtrc.json` and the oxc VS
Code extension instead of the eslint stack, pin TypeScript 6, and their deploy
workflow uses the current GitHub Actions.
