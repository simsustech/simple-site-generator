# Constraints

The quality bar this kit is held to. Short, checkable rows — a row is only worth adding when a session
has already paid for it. Every entry here came from a defect that shipped once.

## Verification

1. **A gate is passed only when its command and its output are quoted.** "Tests pass" is not proof; the
   command, the counts and the exit status are. A change to the design system needs the kit suite
   (`pnpm test`, `pnpm run test:cli`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run format:check`)
   _and_ the build of at least one site that consumes it.
2. **Numeric claims come from computed values, not from a screenshot.** Type size, spacing, geometry and
   colour are read with `getComputedStyle` and `getBoundingClientRect`. A scaled screenshot is fine for
   judgement and useless for measurement: a 42 px heading was once read as "64 px" off a 1540 px-wide
   thumbnail.
3. **Validate a probe before believing a zero.** A scan that reports "0 problems" has to be shown to catch
   one known problem first. The contrast probe that reported zero failures was reading element
   backgrounds while Quasar painted every button surface on `::before`.

## Styling

4. **Shortcuts compile away.** `ssg-plain__price` and its friends are emitted as a rule _named after the
   shortcut_; the utilities inside it (`b-t`, `b-b`) never appear as selectors. To attribute a style,
   walk `document.styleSheets` and test `el.matches(selectorText)` per element — grepping the built CSS
   for a utility name cannot answer "which rule styles this element".
5. **`border-style` alone paints the CSS initial width.** `b-solid` styles all four sides, so a side
   carrying no explicit width renders at `medium` — 3 px — and a hairline becomes a box. Name the style
   per side (`b-t-solid`, `b-b-solid`), the way `ssg-faq__item` does.
6. **Quasar paints on `::before`.** The surface, outline and radius of `q-btn`, `q-card` and `q-menu`
   live on the pseudo-element (`border-radius: inherit`), so element-level `backgroundColor` and
   `borderRadius` reads are incomplete, and a preflight override has to cover element _and_ pseudo-element.
7. **Markup class → shortcut.** Every class in template markup is an `ssg-*` shortcut in `design.ts`;
   `ssg verify` fails otherwise. No inline `<style>` in a template except a single drawing that belongs
   to one page.

## Environment

8. **pnpm needs two variables here.** `npm_config_manage_package_manager_versions=false` (the pinned
   12.4.1 cannot be installed; `~/.local/share/pnpm` is read-only) and a writable
   `npm_config_store_dir` on every invocation — otherwise pnpm leaves a `.pnpm-store/` at the discovered
   workspace root (once 619 MB).
9. **The git hooks shell out to pnpm.** `pre-commit` runs oxlint and oxfmt and `commit-msg` runs
   commitlint, both through pnpm, so the variable above is needed to _commit_, not only to install.
   Read the hook before the first commit in a repo; never `--no-verify`.
10. **A `file:` dependency is a hardlinked copy.** After changing the kit: `pnpm run build` here, then
    `pnpm install` in the consuming site. Skipping the reinstall silently keeps the old behaviour.
11. **Template literals in `getCSS()` are JavaScript.** A backtick anywhere inside one — in prose as much
    as in CSS — terminates it and breaks the build with an error pointing at the comment. A hole in a
    `/* … */` inside one is parsed as CSS and fails as `Unknown word`.
