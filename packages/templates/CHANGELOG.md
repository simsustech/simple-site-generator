# @simple-site-generator/templates

## 0.1.20

### Patch Changes

- 009e85e: Restore the hero image's accent-coloured shadow in `small-business-v2`.

  The avatar uses the template's own `avatar-border` class again, instead of the
  `shadow-lg shadow-accent` UnoCSS utilities. The colour in those utilities comes
  from the consumer's `vitrify.unocss` theme, so apps that do not configure it
  (such as hvbnicky) never generate `.shadow-accent` and the shadow disappeared.

## 0.1.19

### Patch Changes

- b9491bb: Restore the hero background gradient in `small-business-v2`. The hero uses the
  template's own `page-background` class again, instead of UnoCSS utilities that
  consumers without a `vitrify.unocss` config never generate, which left the
  landing page without a background.
- b9491bb: Modernize the toolchain: oxlint and oxfmt replace eslint and prettier, and
  everything moves to pnpm 12 and Node 20.19+, with dependencies updated (vite 8,
  vue 3.5.42, quasar 2.32, vitrify 0.28).

  Scaffolded projects now ship `.oxlintrc.json`/`.oxfmtrc.json` and the oxc VS
  Code extension instead of the eslint stack, pin TypeScript 6, and their deploy
  workflow uses the current GitHub Actions.

## 0.1.18

### Patch Changes

- 728294b: fix(templates): fix small-business template layout

## 0.1.17

### Patch Changes

- bcc48b4: fix(templates): fix routes for nested pages

## 0.1.16

### Patch Changes

- 5ef28d3: fix(templates): add margins to Landing photo

## 0.1.15

### Patch Changes

- 5355865: feat(templates): add instagram and facebook links to small-business-v2

## 0.1.14

### Patch Changes

- 434e4b3: fix(templates): fix layout icons

## 0.1.13

### Patch Changes

- 3d32e99: fix(templates): fix QPageScroller

## 0.1.12

### Patch Changes

- 9189f3b: chore: update templates

## 0.1.11

### Patch Changes

- 540e897: fix(templates): fix one-page layout and seo

## 0.1.10

### Patch Changes

- 07c8a28: chore(templates): update one-page
- aca0a6b: fix(templates): set fetchpriority high

## 0.1.9

### Patch Changes

- feb2326: chore: update templates

## 0.1.8

### Patch Changes

- d57c6d3: fix(templates): update templates

## 0.1.7

### Patch Changes

- 7ec70e2: feat(templates): add one-page template

## 0.1.6

### Patch Changes

- b08f0ce: chore: add copyright text

## 0.1.5

### Patch Changes

- df9b484: Update packages

## 0.1.4

### Patch Changes

- b20dd30: fix(templates): fix small-business LandingPage image height"
- 657fff8: chore: update dependencies

## 0.1.3

### Patch Changes

- a455612: chore(templates): update packages

## 0.1.2

### Patch Changes

- 0198cb9: fix(templates): add square to q-avatar
- a212e7f: fix(templates): fix icon parsing in templates

## 0.1.1

### Patch Changes

- 060240b: Update templates
