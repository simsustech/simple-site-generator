import { createServer, type Server } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'

/**
 * Minimal static file server for `ssg verify`.
 *
 * `verify` must measure the *built* site exactly as a static host would serve
 * it, so it serves `dist/static` on an ephemeral port rather than reusing a dev
 * server (which would report dev transforms, not the deployed bytes).
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

    for (const candidate of candidatesFor(absoluteRoot, pathname)) {
      try {
        const info = await stat(candidate)

        if (!info.isFile()) continue

        response.writeHead(200, {
          'content-type':
            CONTENT_TYPES[extname(candidate)] ?? 'application/octet-stream',
          'content-length': info.size
        })
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
