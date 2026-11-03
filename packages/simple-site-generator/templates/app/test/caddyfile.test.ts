// @vitest-environment node

import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'

/**
 * The server configuration, as a test rather than an assumption.
 *
 * `build/Caddyfile` is not only configuration: the build copies it into
 * `dist/static/Caddyfile`, the deploy puts it in the web root, and the server
 * imports `/srv/<host>/Caddyfile`. What is written here is what production runs,
 * and neither a compiler nor a linter checks it.
 *
 * Every assertion below is a failure that is silent:
 *
 * - `hide Caddyfile` with a leading slash validates and does nothing, because
 *   `hide` matches on file name — which serves the whole configuration, comments
 *   included, on `GET /Caddyfile`.
 * - A `@hashed` class without `-` in it. Rolldown hashes in base64url, so the
 *   hash itself contains `-` and `_`; a class without them silently exempts
 *   exactly those files from `immutable`, which is the only purpose of the rule.
 * - An open-ended hash class, which also matches an ordinary hyphenated name
 *   (`server-renderer.mjs`) and pins a changing file for a year.
 * - A 404 rewrite to a file nothing builds: the rewrite needs the explicit `404`
 *   route in `src/router/routes.ts`, because the prerenderer writes one HTML file
 *   per concrete route path and a catch-all pattern is not one.
 */

const read = (path: string) =>
  readFile(new URL(`../${path}`, import.meta.url), 'utf8')

/**
 * The configuration without its comments.
 *
 * Every assertion below counts directives, and the comments name them: the note
 * about `hide` mentions `hide` itself. Counting on the raw text lets the prose
 * count as configuration, and then a test passes for the wrong reason.
 */
function directives(config: string): string {
  return config
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('#'))
    .join('\n')
}

const FILES = ['build/Caddyfile', 'build/Caddyfile.preview']

describe('the configuration is not fetchable', () => {
  it.each(FILES)('hides the file in %s', async (path) => {
    const config = directives(await read(path))

    expect(config).toContain('hide Caddyfile')
    // `hide /Caddyfile` validates and then does nothing. This assertion exists
    // because that failure gives no signal at all.
    expect(config).not.toContain('hide /Caddyfile')
  })

  it.each(FILES)('hides it in every file_server, not one', async (path) => {
    const config = directives(await read(path))
    const servers = config.split('file_server').length - 1
    const hides = config.split('hide Caddyfile').length - 1

    // The normal route and the error handler both serve files.
    expect(servers).toBe(2)
    expect(hides).toBe(servers)
  })
})

describe('the cache rules follow the names the bundler makes', () => {
  it.each(FILES)('matches a base64url hash in %s', async (path) => {
    const config = directives(await read(path))

    expect(config).toContain('immutable')
    expect(config).toContain('@hashed path_regexp hashed -[A-Za-z0-9_-]{8}\\.')
  })
})

describe('the error page exists as a file', () => {
  it.each(FILES)('rewrites a 404 to /404.html in %s', async (path) => {
    expect(directives(await read(path))).toContain(
      'rewrite @notFound /404.html'
    )
  })
})
