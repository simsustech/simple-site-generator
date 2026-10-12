import { join, resolve } from 'node:path'

/**
 * Where things live inside a generated project.
 *
 * Every command resolves paths through here so `ssg check`, `ssg build` and
 * `ssg verify` cannot disagree about which directory they are reading.
 */

/** The generated project root. */
export function appDir(cwd: string = process.cwd()): string {
  return resolve(cwd)
}

/** `src/pages` — the single source of truth for the site's pages. */
export function pagesDir(app: string = appDir()): string {
  return join(app, 'src', 'pages')
}

/** `public` — copied verbatim into the build output. */
export function publicDir(app: string = appDir()): string {
  return join(app, 'public')
}

/** `dist/static` — the SSG output that gets deployed. */
export function distDir(app: string = appDir()): string {
  return join(app, 'dist', 'static')
}

/** Where the generated app's `vitrify.config.ts` lives. */
export function configPath(app: string = appDir()): string {
  return join(app, 'vitrify.config.ts')
}
