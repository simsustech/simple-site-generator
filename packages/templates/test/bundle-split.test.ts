import { readdir, readFile, stat } from 'node:fs/promises'
// The built package is inspected on disk, and a `file:` `import.meta.url` is
// required to resolve it — so this spec runs in the node environment, not
// happy-dom.
// @vitest-environment node
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * D9 — `Page.vue` statically imported `@quasar/quasar-ui-qmarkdown` (which pulls
 * in markdown-it, ~170 KB) and `@quasar/quasar-ui-qmediaplayer`, so every page
 * of every template paid for markdown rendering even when it rendered no
 * markdown at all.
 *
 * `PageContent.vue` now loads both through `defineAsyncComponent`. This spec
 * asserts the resulting shape of the built package, which is the only seam that
 * can actually observe it: the entry chunk must be free of markdown code, and
 * markdown-it must live in a separate chunk that is only fetched on demand.
 *
 * The templates package is built before this spec runs — step 2's `(d2)`
 * command is `pnpm run build && pnpm --filter …/templates test`.
 */
const distDir = fileURLToPath(new URL('../dist', import.meta.url))

async function listFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir)
  const files: string[] = []

  for (const entry of entries) {
    const full = join(dir, entry)
    files.push(
      ...((await stat(full)).isDirectory() ? await listFiles(full) : [full])
    )
  }

  return files
}

describe('built package splits markdown out of the entry chunk', () => {
  it('exposes a docs entry point', async () => {
    const entry = join(distDir, 'docs.js')

    expect((await stat(entry)).isFile()).toBe(true)
  })

  it('keeps markdown-it and the media player out of the entry chunk', async () => {
    const entry = await readFile(join(distDir, 'docs.js'), 'utf8')

    expect(entry).not.toContain('markdown-it')
    expect(entry).not.toContain('qmarkdown')
    expect(entry).not.toContain('qmediaplayer')
  })

  it('emits markdown-it as a separate lazy chunk', async () => {
    const chunks = (await listFiles(join(distDir, 'assets'))).filter((file) =>
      file.endsWith('.js')
    )

    const contents = await Promise.all(
      chunks.map(async (file) => ({ file, text: await readFile(file, 'utf8') }))
    )

    const markdownChunk = contents.find(({ text }) =>
      text.includes('markdown-it')
    )

    expect(markdownChunk).toBeDefined()
  })

  it('keeps the entry chunk small enough to stay off the critical path', async () => {
    const entry = join(distDir, 'docs.js')
    const { size } = await stat(entry)

    // Before the fix the shared entry pulled in ~340 KB of markdown + media code.
    expect(size).toBeLessThan(60_000)
  })
})
