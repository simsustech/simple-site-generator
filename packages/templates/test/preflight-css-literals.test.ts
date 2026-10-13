// Reads source files from disk and resolves them with `import.meta.url`, which
// is only a file URL in the node environment — under happy-dom it is not, and
// `fileURLToPath` throws before the test can run.
// @vitest-environment node
import { readFile, readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * Guards the trap `design.ts` documents and that has already been hit twice.
 *
 * A preflight's CSS is returned from a template literal:
 *
 * ```ts
 * { getCSS: () => `...css...` }
 * ```
 *
 * so a single backtick *inside* one — in prose as much as in CSS — closes the
 * literal early. The rest of the CSS is then parsed as JavaScript and the build
 * dies with a parse error pointing at whatever identifier happened to follow,
 * which is nowhere near the actual mistake. Both times it happened, the reported
 * line was a random word in a comment several lines below the offending backtick.
 *
 * This reads the source as **text** and deliberately does not import it: when the
 * literal is broken the module cannot be parsed at all, so a test that imported
 * it would fail for an unrelated reason and inherit the same unhelpful message.
 * Reading the file lets the failure name the exact line instead.
 */
const srcDir = fileURLToPath(new URL('../src', import.meta.url))

const OPENS_LITERAL = /getCSS:\s*\(\)\s*=>\s*`/

async function listTypeScriptFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const full = join(dir, entry.name)
    files.push(
      ...(entry.isDirectory()
        ? await listTypeScriptFiles(full)
        : full.endsWith('.ts')
          ? [full]
          : [])
    )
  }

  return files
}

describe('preflight CSS template literals', () => {
  it('never lets a backtick close a getCSS literal early', async () => {
    const files = await listTypeScriptFiles(srcDir)
    const offenders: string[] = []
    let literals = 0
    let unclosed = 0

    for (const file of files) {
      const lines = (await readFile(file, 'utf8')).split('\n')
      let inside = false

      lines.forEach((line, index) => {
        const where = `${relative(srcDir, file)}:${index + 1}`

        if (!inside) {
          if (OPENS_LITERAL.test(line)) {
            inside = true
            literals += 1
          }
          return
        }

        const ticks = line.match(/`/g)?.length ?? 0

        if (ticks === 0) return

        // The one legitimate backtick is the closing one, and the file's style
        // puts it alone on its line.
        if (ticks === 1 && line.trim() === '`') {
          inside = false
          return
        }

        offenders.push(`${where}: ${line.trim().slice(0, 70)}`)
        // Re-sync the way the parser would: that backtick closed the literal,
        // so anything after it is code, not CSS. Reporting once per stray
        // backtick is more useful than cascading down the rest of the file.
        inside = false
      })

      if (inside) unclosed += 1
    }

    // If the `getCSS` shape changes, this guard would pass by finding nothing —
    // which is worse than failing, so it asserts that it looked at something.
    expect(literals).toBeGreaterThan(0)
    expect(offenders).toEqual([])
    expect(unclosed).toBe(0)
  })
})
