---
'simple-site-generator': patch
'@simple-site-generator/templates': patch
---

Emit the package root, and rebuild the generated 404 page.

**`@simple-site-generator/templates` had no root entry point.** The library build
derives its input from directories that contain `<name>/<name>.ts`, so
`business/`, `docs/`, `landing/`, `design/` and `seo/` were built and `index.ts`
— a *file* — was not. The package still advertised `"."` in its `exports` map and
shipped `index.d.ts`, so `import { CtaButton } from '@simple-site-generator/templates'`
type-checked in every editor and failed to resolve in every build. `index.ts` is
now an entry, and the barrel exports `demoteH1` alongside `demoteHeadings`.

**The generated 404 page** was written against the pre-UnoCSS design system and
inherited three defects: a `fullscreen` overlay that hid the header and footer, so
a lost visitor had no navigation; `bg-primary text-white` with a
`color="white" text-color="blue"` button — Quasar blue on a green page, measured
at **2.54:1**; and a `<style scoped>` block referring to `--ssg-step-2` and
`--ssg-space-2`, tokens that no longer exist, so its type and spacing were
silently unset. It is now a normal section inside the shell, using the kit's
`CtaButton` so the colour pair cannot be hand-picked again.

**The mobile drawer** listed only `menu`-tagged pages, and the contact page is
tagged `contact` because the header renders it as its own button — a button that
lives in the desktop navigation, hidden below `lg`. On a phone the drawer was
therefore the only navigation and had no way to reach the contact page. It now
mirrors the header's contact menu, under the same label and with each page's own
icon.
