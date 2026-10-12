# ADR-0001 — The `<head>` is produced in the layout, from frontmatter

**Status:** accepted

## Context

Quasar's Meta plugin collects `<head>` tags from the components in Vue Router's **active chain** and
writes them into `ssrContext._meta.headTags`, which vitrify then injects into the prerendered HTML.

The obvious place to call `useMeta` is the page component: the page knows its own title and description.
That is what the previous templates did, and it silently failed.

Two kinds of page break it:

- A page marked `noSsr` is wrapped in Quasar's `QNoSsr`. It renders on the client only, so it
  contributes nothing while the server renders the document — and the prerendered HTML ships with no
  meta tags at all.
- A page component resolved lazily (`await import(...)` in the route's `component`) is not collected
  during prerender either.

Both cases are _silent_: the build succeeds, the page renders, the tags simply are not there. The
symptom is "our SEO is correct but we do not rank", which is indistinguishable from a content problem
and therefore very expensive to diagnose.

## Decision

Build the head tags in **`SiteShell`**, the layout, via `useSeo(page, site, path)`.

The layout is the one component guaranteed to be in the active chain on every route. It resolves the
current page from the route path against the same page list the router built, so it has the same
frontmatter the page component would have had — including for `noSsr` and lazy pages.

All the actual logic lives in the pure `buildMeta({ page, site, path })`, which returns a plain object.
`useSeo` is a one-line binding to `useMeta`. That split matters: the interesting behaviour is testable
without mounting a component or booting an app, and the shape can be asserted directly.

The shape is also pinned deliberately. Quasar's `meta` and `link` values are **attribute objects**
(`{ name: 'description', content }` / `{ rel: 'canonical', href }`). Passing a bare string — which reads
as the obvious thing to do — is silently dropped: the tag lands in `window.__Q_META__` and never reaches
the document. Building the object in one place means a page author cannot get it wrong in frontmatter.

## Consequences

- Meta tags are emitted for every route, including `noSsr` and lazily-resolved pages.
- A page cannot set its own head tags in a component; it declares them in frontmatter. This is a
  constraint, and it is the point: one place to look when a tag is wrong.
- `ssg verify` asserts the resulting surface per page (one `<title>`, one absolute canonical on the
  configured origin, a description, parseable JSON-LD, one `<h1>`, `lang`), so a regression here fails
  the build rather than shipping quietly.
- Anything that must vary per-page has to be expressible in frontmatter. Fields like `faq` and
  `breadcrumbs` exist partly for that reason.

## Alternatives considered

- **Per-page `useMeta`** — the original approach; fails for `noSsr` and lazy pages, silently.
- **Transform the HTML after the build** — would work, but it means parsing and rewriting the document
  outside the framework that produced it, and it cannot see the page's frontmatter without re-reading
  the Markdown from disk. Rejected as a second source of truth for the same facts.
- **Write the tags into each page's frontmatter as raw head entries** — moves the Quasar-shape trap into
  user content, which is exactly what this ADR exists to prevent.
