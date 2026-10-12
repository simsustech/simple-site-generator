---
id: gettingstarted
title: Getting started
description: Scaffold a project, add pages and verify the build before you deploy.
label: Getting started
icon:
  name: i-mdi-rocket-launch
tags:
  - menu
---

## Scaffold a project

```bash
pnpm dlx simple-site-generator init my-site --template landing
cd my-site
pnpm install
pnpm dev
```

Replace `landing` with `docs` or `business` to start from a different template.

## Add a page

```bash
ssg add-page services --title "Services" --tags menu
```

This writes `src/pages/services.md` with frontmatter that already satisfies the
page contract. Add `--page Landing` to render it with the conversion layout.

## Check, build, verify

```bash
ssg check     # validate every page's frontmatter
ssg build     # prerender the site into dist/static
ssg verify    # SEO surface, byte budgets and Lighthouse
```

`ssg verify` fails the run on a broken SEO surface (a missing description, two
titles, unparseable JSON-LD) or on an exceeded byte budget, and warns when
Lighthouse performance is below target.

## Deploy

The build output is `dist/static` — plain files. Copy them to any static host.
The included GitHub workflow uses `rsync` to push to your own server; define
`DEPLOY_HOST`, `DEPLOY_USER` and `DEPLOY_KEY` as repository secrets.

> **Note**
> Change the `template` value in `vitrify.config.ts` to switch between `docs`,
> `landing` and `business`.
