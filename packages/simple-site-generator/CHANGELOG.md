# simple-site-generator

## 0.1.3

### Patch Changes

- b9491bb: Modernize the toolchain: oxlint and oxfmt replace eslint and prettier, and
  everything moves to pnpm 12 and Node 20.19+, with dependencies updated (vite 8,
  vue 3.5.42, quasar 2.32, vitrify 0.28).

  Scaffolded projects now ship `.oxlintrc.json`/`.oxfmtrc.json` and the oxc VS
  Code extension instead of the eslint stack, pin TypeScript 6, and their deploy
  workflow uses the current GitHub Actions.

## 0.1.2

### Patch Changes

- 3d32e99: fix(templates): fix QPageScroller

## 0.1.1

### Patch Changes

- df9b484: Update packages
