import { createServer, type Server } from 'node:http'
import { createReadStream } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

/**
 * Minimal static file server for `ssg verify`.
 *
 * `verify` must measure the *built* site the way a real static host serves it,
 * so it serves `dist/static` on an ephemeral port rather than reusing a dev
 * server (which would report dev transforms, not the deployed bytes).
 *
 * "The way a real static host serves it" includes the two things that move
 * Lighthouse most and that a production host always does:
 *
 * - **compression** — Caddy (and every CDN) serves `encode gzip`; a verifier
 *   that ships raw bytes makes every byte budget and every LCP look ~3× worse
 *   than production, so the score is not a measurement of the site.
 * - **caching** — fingerprinted assets are immutable, so a browser (and
 *   Lighthouse's cache audit) must be told that. Without the header the
 *   `cache-insight` audit fails for a site whose host would pass it.
 */
const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2'
}

const COMPRESSIBLE = new Set([
  'text/html; charset=utf-8',
  'text/plain; charset=utf-8',
  'text/css; charset=utf-8',
  'text/javascript; charset=utf-8',
  'application/json; charset=utf-8',
  'application/xml; charset=utf-8',
  'image/svg+xml'
])

/** Vite fingerprints assets as `name-<hash>.ext`; those are immutable. */
const IMMUTABLE = /-[A-Za-z0-9_-]{8,}\.[a-z0-9]+$/

function contentType(file: string): string {
  return CONTENT_TYPES[extname(file)] ?? 'application/octet-stream'
}

function cacheControl(file: string, type: string): string {
  if (IMMUTABLE.test(file)) return 'public, max-age=31536000, immutable'
  if (type.startsWith('text/html')) return 'no-cache'

  return 'public, max-age=3600'
}

export interface StaticServer {
  url: string
  port: number
  close: () => Promise<void>
}

/** Candidate files for a request path, in the order a static host would try. */
function candidatesFor(root: string, pathname: string): string[] {
  const clean = normalize(decodeURIComponent(pathname)).replace(
    /^(\.\.[/\\])+/,
    ''
  )
  const base = join(root, clean)

  if (extname(base)) return [base]

  return [join(base, 'index.html'), `${base}.html`, join(base, 'index.html')]
}

export async function startStaticServer(root: string): Promise<StaticServer> {
  const absoluteRoot = resolve(root)

  const server: Server = createServer(async (request, response) => {
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
    const acceptsGzip = /\bgzip\b/.test(
      request.headers['accept-encoding'] ?? ''
    )

    for (const candidate of candidatesFor(absoluteRoot, pathname)) {
      try {
        const info = await stat(candidate)

        if (!info.isFile()) continue

        const type = contentType(candidate)
        const headers: Record<string, string> = {
          'content-type': type,
          'cache-control': cacheControl(candidate, type),
          vary: 'Accept-Encoding'
        }

        if (acceptsGzip && COMPRESSIBLE.has(type)) {
          const body = gzipSync(await readFile(candidate))

          response.writeHead(200, {
            ...headers,
            'content-encoding': 'gzip',
            'content-length': body.length
          })
          response.end(body)

          return
        }

        response.writeHead(200, { ...headers, 'content-length': info.size })
        createReadStream(candidate).pipe(response)

        return
      } catch {
        // Try the next candidate.
      }
    }

    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('Not found')
  })

  await new Promise<void>((done, fail) => {
    server.once('error', fail)
    // Port 0 → the OS picks a free port, so parallel runs cannot collide.
    server.listen(0, '127.0.0.1', () => done())
  })

  const address = server.address()

  if (!address || typeof address === 'string') {
    server.close()
    throw new Error('static server did not bind to a port')
  }

  return {
    url: `http://127.0.0.1:${address.port}`,
    port: address.port,
    close: () =>
      new Promise<void>((done) => {
        server.close(() => done())
      })
  }
}
