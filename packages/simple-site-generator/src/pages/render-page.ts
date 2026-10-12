import matter from 'gray-matter'
import type { PageTag } from './page-schema.js'

export interface NewPageInput {
  /** Route segment, e.g. `services` or `services/leaks`. */
  id: string
  title: string
  description: string
  label?: string
  order?: number
  tags?: PageTag[]
  /** Template component to render, e.g. `Landing`. */
  page?: string
}

/**
 * Build the markdown source for a new page.
 *
 * Frontmatter is serialised by `gray-matter`, so keys it does not understand are
 * preserved and the output round-trips through the same parser `ssg check` uses.
 * The body is a placeholder that already respects the heading contract — the
 * page template owns the `<h1>`, so content starts at `##`.
 */
export function renderPage(input: NewPageInput): string {
  const data: Record<string, unknown> = {
    id: input.id,
    title: input.title,
    description: input.description
  }

  if (input.label) data.label = input.label
  if (input.order !== undefined) data.order = input.order
  if (input.tags?.length) data.tags = input.tags
  if (input.page) data.page = input.page

  const body = [
    '## Overview',
    '',
    `${input.title} — replace this with the page content.`,
    '',
    '<!--',
    '  Writing notes:',
    '  - The page title above is already the <h1>. Start body headings at "##".',
    "  - Answer the page's main question in the first paragraph.",
    '  - See CONTENT-BLUEPRINT.md for the service x location matrix and',
    '    internal-linking rules.',
    '-->',
    ''
  ].join('\n')

  return matter.stringify(body, data)
}

/**
 * Derive a page id from a file path, so `src/pages/GettingStarted/Install.md`
 * becomes `GettingStarted/Install`.
 */
export function idFromPath(relativePath: string): string {
  return relativePath.replace(/\\/g, '/').replace(/\.md$/, '')
}
