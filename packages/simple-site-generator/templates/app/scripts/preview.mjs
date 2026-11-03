#!/usr/bin/env node
/**
 * `pnpm preview` — build the site, then serve `dist/static` through the same
 * Caddyfile shape production runs.
 *
 * Why this is a script and not one more `&&` in the package script:
 *
 * 1. **Caddy prints no URL for a `:port` site block.** `caddy run` logs
 *    `serving initial configuration` and a JSON line with `"addr":":8150"`, which
 *    is not something you can click, so the address you are supposed to open is
 *    knowledge you have to carry. This prints it before the server starts.
 * 2. **A busy port serves the wrong site.** Caddy binds with `reuseport`, so two
 *    previews on one port both "succeed" and the kernel hands each request to
 *    whichever process it likes: one site's HTML with another site's modules,
 *    which surfaces in the console as a module that "doesn't provide an export
 *    named …". A port far from the crowd, printed before use, is the cheap fix.
 *
 * `PREVIEW_PORT` overrides both the printed and the bound port.
 */
import { spawn } from 'node:child_process'

/** 8095 is what several other Caddyfiles default to; this one stays clear. */
const DEFAULT_PORT = '8150'

const port = process.env.PREVIEW_PORT?.trim() || DEFAULT_PORT

console.log(`\n  Preview: http://localhost:${port}`)
console.log(
  `  (port ${port}; set PREVIEW_PORT=<port> pnpm preview to use another)\n`
)

const child = spawn(
  'caddy',
  ['run', '--config', 'build/Caddyfile.preview', '--adapter', 'caddyfile'],
  {
    stdio: 'inherit',
    env: { ...process.env, PREVIEW_PORT: port }
  }
)

child.on('error', (error) => {
  console.error(`Could not start caddy: ${error.message}`)
  process.exit(1)
})

const stop = (signal) => () => child.kill(signal)
process.on('SIGINT', stop('SIGINT'))
process.on('SIGTERM', stop('SIGTERM'))

child.on('exit', (code, signal) => {
  process.exit(signal ? 0 : (code ?? 0))
})
