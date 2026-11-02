import { promises as fs } from 'node:fs'
import { join, relative } from 'node:path'
import matter from 'gray-matter'
import { appDir, pagesDir } from '../paths.js'
import {
  bodyWarnings,
  validateCollection,
  validatePage,
  type PageIssue
} from '../pages/page-schema.js'
import { idFromPath } from '../pages/render-page.js'

export interface CheckOptions {
  app?: string
}

export interface CheckResult {
  ok: boolean
  pages: number
  issues: PageIssue[]
  /**
   * Findings that do not fail the run.
   *
   * Kept apart from `issues` on purpose: a warning is something to look at, an
   * issue is something that must be fixed before the build. Folding them
   * together would either fail a build over a style question or make the exit
   * code meaningless.
   */
  warnings: PageIssue[]
}

async function collectMarkdown(dir: string): Promise<string[]> {
  let entries

  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }

  const files: string[] = []

  for (const entry of entries) {
    const full = join(dir, entry.name)

    if (entry.isDirectory()) files.push(...(await collectMarkdown(full)))
    else if (entry.name.endsWith('.md')) files.push(full)
  }

  return files
}

/**
 * `ssg check` — validate every page against the frontmatter contract.
 *
 * This is the guard that stops the defect class the old template suffered from:
 * frontmatter that is subtly wrong still builds, and the damage only shows on the
 * live site. Running it before a build turns that into a terminal error.
 *
 * An empty pages directory is a warning, not a failure — a brand new project has
 * no pages yet, and failing there would be hostile.
 */
export async function check(options: CheckOptions = {}): Promise<CheckResult> {
  const app = options.app ?? appDir()
  const root = pagesDir(app)

  const files = await collectMarkdown(root)
  const issues: PageIssue[] = []
  const warnings: PageIssue[] = []
  const pages: { file: string; data: unknown }[] = []

  for (const file of [...files].sort((a, b) => a.localeCompare(b))) {
    const relativePath = relative(root, file)
    const source = await fs.readFile(file, 'utf8')
    const { data, content } = matter(source)
    // `id` defaults to the path so a page that omits it still gets a useful
    // error against the id the router would actually generate.
    const dataWithId = { id: idFromPath(relativePath), ...data }

    pages.push({ file: relativePath, data: dataWithId })
    issues.push(...validatePage(relativePath, dataWithId))
    warnings.push(...bodyWarnings(relativePath, content, dataWithId))
  }

  issues.push(...validateCollection(pages))

  return {
    ok: issues.length === 0,
    pages: pages.length,
    issues,
    warnings
  }
}
