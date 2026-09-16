# create-simple-site-generator

## 0.2.0

### Minor Changes

- b9491bb: Modernize the toolchain: oxlint and oxfmt replace eslint and prettier, and
  everything moves to pnpm 12 and Node 20.19+, with dependencies updated (vite 8,
  vue 3.5.42, quasar 2.32, vitrify 0.28).

  Scaffolded projects now ship `.oxlintrc.json`/`.oxfmtrc.json` and the oxc VS
  Code extension instead of the eslint stack, pin TypeScript 6, and their deploy
  workflow uses the current GitHub Actions.

## 0.1.6

### Patch Changes

- df9b484: Update packages

## 0.1.5

### Patch Changes

- 657fff8: chore: update dependencies

## 0.1.4

### Patch Changes

- e6dc952: fix(create-simple-site-generator): escape working-directory input

## 0.1.3

### Patch Changes

- ae6f20e: fix(create-simple-site-generator): fix sorting of pages to prevent hydration errors

## 0.1.2

### Patch Changes

- d217bda: fix(create-simple-site-generator): use copyFile instead of render for copying the Caddyfile

## 0.1.1

### Patch Changes

- a3ab8b8: Update create-simple-site-generator
