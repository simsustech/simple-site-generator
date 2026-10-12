import { promises as fs } from 'node:fs'
import { join, relative } from 'node:path'
import matter from 'gray-matter'
import { buildRobots, buildSitemap } from './sitemap.js'
import type { SeoContext, SeoPage } from '../shared/types.js'

export interface SsgSitemapOptions {
  /** Site identity, read from the `ssg` block of `vitrify.config.ts`. */
  site: SeoContext
  /** Absolute path to `src/pages`. */
  pagesDir: string
  /** Absolute path to the build output root (`dist`). */
  distDir: string
  /** Extra paths to keep out of the crawl, on top of the default `/404`. */
  disallow?: string[]
}

/**
 * Emit `sitemap.xml` and `robots.txt` into the static output.
 *
 * Both are generated from the same frontmatter the router reads, so a page can
 * never appear in the navigation but be missing from the sitemap (or worse, be
 * listed in the sitemap while marked `noindex`).
 */
export function ssgSitemap(options: SsgSitemapOptions) {
  return {
    name: 'ssg-sitemap',
    apply: 'build' as const,
    async closeBundle() {
      const pages = await readPages(options.pagesDir)

      const staticDir = join(options.distDir, 'static')
      await fs.mkdir(staticDir, { recursive: true })

      await Promise.all([
        fs.writeFile(
          join(staticDir, 'sitemap.xml'),
          buildSitemap({ site: options.site, pages }),
          'utf8'
        ),
        fs.writeFile(
          join(staticDir, 'robots.txt'),
          buildRobots({ site: options.site, disallow: options.disallow }),
          'utf8'
        )
      ])
    }
  }
}

/**
 * Read every markdown page and project it onto the fields the SEO builders use.
 *
 * `lastmod` comes from the file's mtime, so it stays correct without anyone
 * having to remember to bump a date in frontmatter.
 */
async function readPages(pagesDir: string): Promise<SeoPage[]> {
  const files = await collectMarkdown(pagesDir)

  return Promise.all(
    files.map(async (file) => {
      const [raw, stats] = await Promise.all([
        fs.readFile(file, 'utf8'),
        fs.stat(file)
      ])

      const { data } = matter(raw)

      // The frontmatter `id` is authoritative — it is what the router uses to
      // build the route. Deriving it from the file path instead made the sitemap
      // disagree with the site: `Index.md` was listed as `/Index` rather than
      // `/`, and `Contact.md` as `/Contact` rather than the declared `/contact`.
      const pathId = relative(pagesDir, file)
        .replace(/\\/g, '/')
        .replace(/\.md$/, '')
      const id = typeof data.id === 'string' && data.id ? data.id : pathId

      return {
        id,
        title: data.title,
        description: data.description,
        image: data.image,
        noindex: data.noindex ?? id === 'Error404Page',
        lastmod: stats.mtime.toISOString().slice(0, 10),
        breadcrumbs: data.breadcrumbs,
        faq: data.faq,
        tags: data.tags
      } satisfies SeoPage
    })
  )
}

async function collectMarkdown(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const full = join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await collectMarkdown(full)))
    } else if (entry.name.endsWith('.md')) {
      files.push(full)
    }
  }

  return files
}
