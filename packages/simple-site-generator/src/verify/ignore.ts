import { matchesGlob } from 'node:path'

/**
 * True when a built page (its path relative to the output root) matches one of
 * the `--ignore` globs.
 *
 * Kept in its own module — rather than inline in `verify.ts` — so it can be
 * unit-tested without importing the Lighthouse half of the verifier.
 */
export function isIgnored(page: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => matchesGlob(page, pattern))
}
