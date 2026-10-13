import { promises as fs } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * Copy the hand-written declarations (`../types/*.d.ts`) next to the built
 * JavaScript (`../dist/*.js`).
 *
 * `../types/` is the source of truth for the hand-written declarations, and
 * `exports` points its `types` condition at the copies in `dist/` so that they
 * sit next to the file each entry resolves to. That matters because some
 * tooling — notably an editor's long-lived TypeScript program — resolves a
 * subpath to `dist/<entry>.js` and then looks for a sibling `dist/<entry>.d.ts`,
 * ignoring the `types` condition.
 */
const typesDir = fileURLToPath(new URL('../types', import.meta.url))
const distDir = fileURLToPath(new URL('../dist', import.meta.url))

const files = (await fs.readdir(typesDir)).filter((file) =>
  file.endsWith('.d.ts')
)

await Promise.all(
  files.map((file) => fs.copyFile(`${typesDir}/${file}`, `${distDir}/${file}`))
)

console.log(`templates: emitted ${files.length} declaration file(s) into dist/`)
