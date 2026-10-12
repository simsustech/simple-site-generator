# simple-site-generator

Tools and instructions for an AI agent to roll out a **complete, working, beautiful and fast website**.

You describe the site; the kit scaffolds it, enforces a page contract, prerenders it to static HTML, and
then refuses to accept the result unless it is actually correct and fast.

## Quick start

```bash
pnpm dlx simple-site-generator init my-site --template landing --site-name "Acme Plumbing" --url https://acme.com
cd my-site
pnpm install
ssg check      # validate page frontmatter
ssg build      # prerender to dist/static
ssg verify     # SEO surface + byte budgets + Lighthouse
```

Three templates: `docs`, `landing` (conversion-oriented single page), `business` (multi-page local
business).

## The `ssg` commands

| command             | what it does                                                                         |
| ------------------- | ------------------------------------------------------------------------------------ |
| `ssg init [dir]`    | scaffold a project. `--template`, `--site-name`, `--url`, `--yes` (never prompt)     |
| `ssg add-page <id>` | create a page with valid frontmatter. `--title`, `--description`, `--tags`, `--page` |
| `ssg check`         | validate every page against the contract                                             |
| `ssg build`         | `vitrify build -m ssg` → `dist/static`                                               |
| `ssg verify`        | assert the built site, then exit non-zero if it is not good enough                   |

`ssg verify` fails on: more than one `<title>`, a missing or non-absolute canonical, a missing
description, unparseable JSON-LD, more than one `<h1>`, a missing `lang`, a JavaScript budget over
250 KB, a CSS budget over 60 KB, or an accessibility / best-practices / SEO score below 100. Performance
only warns (it varies by machine).

It needs Chromium for the Lighthouse half — set `CHROME_PATH`, or pass `--no-lighthouse` to run the
deterministic half only.

## Writing for agents

- **[AGENTS.md](packages/simple-site-generator/AGENTS.md)** — the contract an agent follows: the page
  schema, the SEO rules, the conversion rules, the budgets, and the anti-patterns that caused real
  defects here.
- **[CONTENT-BLUEPRINT.md](packages/simple-site-generator/CONTENT-BLUEPRINT.md)** — what to write: the
  service × location matrix, internal linking, E-E-A-T signals, and answer-first structure for AI
  summaries.
- **[CONTEXT.md](CONTEXT.md)** — the architecture, and why it is shaped this way.
- **[docs/adr/](docs/adr/)** — the two load-bearing decisions.

## Packages

| package                                                   | role                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------- |
| [`simple-site-generator`](packages/simple-site-generator) | the kit: the `ssg` CLI, the app template and the agent docs         |
| [`@simple-site-generator/templates`](packages/templates)  | the three template modules and the shared layer they are built from |

`create-simple-site-generator` is **retired** — use `ssg init`. Its app template moved to
`simple-site-generator/templates/app`.

## Development

```bash
pnpm install
pnpm run build        # templates, then the CLI
pnpm test             # unit + component tests (vitest)
pnpm run test:cli     # the ssg CLI, exercised as a subprocess
pnpm run typecheck
pnpm run lint
pnpm run format:check
```

End-to-end specs in `tests/e2e` run with Playwright against a served build:

```bash
SSG_E2E_URL=http://127.0.0.1:4173 pnpm run test:e2e
```

## License

MIT
