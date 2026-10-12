import { describe, expect, it } from 'vitest'

/**
 * D5 — the router's page glob matched **zero** files, so every markdown page
 * silently disappeared from the build while the app still compiled and served an
 * empty site.
 *
 * The true root cause, established by probing Vite 8 directly, is the **bare,
 * unprefixed path** — not the extglob alternation. Vite hard-rejects a pattern
 * that starts with neither `/` nor `./`, and the message names the requirement.
 *
 * That is why this file must never *contain* the broken pattern: the transform
 * throws while loading the module, so the failure is not observable as a value —
 * it takes the whole test file down. The guard is therefore positive: the
 * relative alternation form used by `routes.ts` must match every page.
 *
 * Vitest runs through Vite, so `import.meta.glob` here has real Vite semantics.
 * `eager: false` matches the files without executing them.
 */

// The exact message Vite 8 raises for a bare pattern (kept as a line comment: a
// glob literal contains a `*` followed by `/`, which would close a block
// comment early and turn the rest of the comment into code):
//   Error: Invalid glob: "src/pages/**/*.(md|vue)".
//     It must start with '/' or './'      (plugin: vite:import-glob)

// The pattern applied in the app template's `src/router/routes.ts`.
const pagePattern = import.meta.glob('./fixtures/pages/**/*.{md,vue}')

// Equivalent matching behaviour, proving the extglob form was never the problem.
const extglobPattern = import.meta.glob('./fixtures/pages/**/*.(md|vue)')

describe('page glob', () => {
  it('matches every markdown and vue page', () => {
    const paths = Object.keys(pagePattern)

    expect(paths).toContain('./fixtures/pages/Index.md')
    expect(paths).toContain('./fixtures/pages/Contact.md')
    expect(paths).toContain('./fixtures/pages/GettingStarted/GettingStarted.md')
    expect(paths).toContain('./fixtures/pages/CustomPage.vue')
    expect(paths).toHaveLength(4)
  })

  it('matches nested pages, not just top-level ones', () => {
    const nested = Object.keys(pagePattern).filter((path) =>
      path.includes('/GettingStarted/')
    )

    expect(nested).toHaveLength(1)
  })

  it('is relative, because a bare path is rejected by Vite', () => {
    // Every key Vite returns is prefixed with `./`, which is what the pattern
    // must be for the glob to resolve at all (see the module comment).
    for (const path of Object.keys(pagePattern)) {
      expect(path.startsWith('./')).toBe(true)
    }
  })

  it('matches the same set with the extglob form — it was never the cause of D5', () => {
    // Pinning this deliberately: it documents that the old pattern's failure was
    // its missing `./` prefix, and stops anyone "fixing" this by blaming extglob.
    expect(Object.keys(extglobPattern).sort()).toEqual(
      Object.keys(pagePattern).sort()
    )
  })

  it('excludes the error page, which the router adds separately', () => {
    const withExclusion = import.meta.glob([
      './fixtures/pages/**/*.{md,vue}',
      '!**/Error404Page.vue'
    ])

    expect(
      Object.keys(withExclusion).some((path) => path.includes('Error404Page'))
    ).toBe(false)
  })
})
