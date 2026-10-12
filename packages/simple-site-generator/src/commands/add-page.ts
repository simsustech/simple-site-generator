import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { appDir, pagesDir } from '../paths.js'
import { PAGE_TAGS } from '../pages/page-schema.js'
import { renderPage } from '../pages/render-page.js'
import type { PageTag } from '../pages/page-schema.js'

export interface AddPageOptions {
  /** Route segment: `services`, or `services/leaks` for a nested page. */
  id: string
  title?: string
  description?: string
  label?: string
  order?: number
  tags?: PageTag[]
  page?: string
  app?: string
}

export interface AddPageResult {
  file: string
  id: string
}

function titleFromId(id: string): string {
  const last = id.split('/').filter(Boolean).pop() ?? id

  return last
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

/**
 * `ssg add-page` — create a page with valid frontmatter.
 *
 * Generates the file through the same `renderPage` the schema validates, so a
 * page created by the CLI cannot fail `ssg check`. It refuses to overwrite: an
 * agent re-running a command must never silently destroy content.
 */
export async function addPage(options: AddPageOptions): Promise<AddPageResult> {
  const app = options.app ?? appDir()
  const id = options.id.replace(/^\/+/, '').replace(/\.md$/, '')

  if (!id) {
    throw new Error('add-page requires a page id, e.g. `ssg add-page about`')
  }

  const file = join(pagesDir(app), `${id}.md`)

  try {
    await fs.access(file)
    throw new Error(
      `Refusing to overwrite ${file} — a page with id "${id}" already exists.`
    )
  } catch (error) {
    // `fs.access` throwing ENOENT is the expected path; anything else is real.
    if (error instanceof Error && !/ENOENT/.test(error.message)) throw error
  }

  const title = options.title ?? titleFromId(id)

  const source = renderPage({
    id,
    title,
    description:
      options.description ??
      `${title} — replace this with a one-sentence summary of the page.`,
    label: options.label,
    order: options.order,
    tags: options.tags,
    page: options.page
  })

  await fs.mkdir(dirname(file), { recursive: true })
  await fs.writeFile(file, source, 'utf8')

  return { file, id }
}

export { PAGE_TAGS }
