import { z } from 'zod'

/**
 * The page frontmatter contract.
 *
 * This is the guard that stops the class of bug the old template suffered from:
 * a page whose frontmatter is subtly wrong builds and deploys, and the damage is
 * only visible on the live site. `ssg check` runs this before a build, so a typo
 * fails in the terminal instead of in production.
 */

/** Tags the templates understand. An unknown tag means a menu entry silently vanishes. */
export const PAGE_TAGS = ['menu', 'footer', 'contact'] as const

export type PageTag = (typeof PAGE_TAGS)[number]

export const pageFrontmatterSchema = z.object({
  /** Route segment: `undefined`-free, because the router builds `/${id}` from it. */
  id: z.string().min(1, 'id must not be empty'),
  /** Used verbatim as the `<h1>` and in the `<title>`. */
  title: z.string().min(1, 'title is required'),
  /** The meta description. Required: a page without one is invisible to search. */
  description: z.string().min(1, 'description is required'),
  /** Navigation label; falls back to `title` in the templates. */
  label: z.string().min(1).optional(),
  /** Sort weight; the home page is always first. */
  order: z.number().optional(),
  tags: z.array(z.enum(['menu', 'footer', 'contact'])).optional(),
  /** Keep the page out of the index and the sitemap. */
  noindex: z.boolean().optional(),
  /** Render client-side only (for pages that cannot be prerendered). */
  noSsr: z.boolean().optional(),
  /** Template component to render, e.g. `Landing`. */
  page: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
  breadcrumbs: z.array(z.string().min(1)).optional(),
  faq: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1)
      })
    )
    .optional(),
  cta: z
    .object({
      message: z.string().min(1),
      route: z.string().min(1).optional()
    })
    .optional(),
  /**
   * The hero's animated process graphic (`shared/HeroDemo.vue`).
   *
   * Two stops minimum: the graphic draws a route between them, and one stop is a
   * dot with a label, not a process. Rejected here rather than rendered badly,
   * because the templates degrade silently — a malformed `demo` would just show
   * nothing.
   */
  demo: z
    .object({
      steps: z.array(z.string().min(1)).min(2),
      label: z.string().min(1).optional()
    })
    .optional(),
  /**
   * The principles band (`shared/PrincipleGrid.vue`).
   *
   * At least one item, and every item needs both halves: the component renders a
   * heading and a body per card, so a title with no text is an empty box in the
   * layout. Rejected here rather than rendered badly, because a malformed
   * `principles` shows nothing at all.
   */
  principles: z
    .object({
      heading: z.string().min(1).optional(),
      leading: z.string().min(1).optional(),
      items: z
        .array(
          z.object({
            title: z.string().min(1),
            text: z.string().min(1)
          })
        )
        .min(1),
      note: z.string().min(1).optional()
    })
    .optional(),
  /** Ids of pages nested under this one in the navigation. */
  subpages: z.array(z.string().min(1)).optional(),
  lists: z.array(z.unknown()).optional(),
  cards: z.array(z.unknown()).optional(),
  images: z.array(z.unknown()).optional(),
  videos: z.array(z.unknown()).optional(),
  extra: z.record(z.string(), z.unknown()).optional()
})

export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>

export interface PageIssue {
  /** Project-relative path of the offending page. */
  file: string
  message: string
}

/** Validate one page's frontmatter, returning every problem rather than the first. */
export function validatePage(file: string, data: unknown): PageIssue[] {
  const result = pageFrontmatterSchema.safeParse(data)

  if (result.success) return []

  return result.error.issues.map((issue) => ({
    file,
    message: issue.path.length
      ? `${issue.path.join('.')}: ${issue.message}`
      : issue.message
  }))
}

/**
 * Validate the collection as a whole.
 *
 * Uniqueness and referential integrity are only checkable with every page in
 * hand: two files claiming the same `id` produce two identical routes (one
 * silently unreachable), and a `subpages` entry pointing at a missing page
 * produces a dead navigation link.
 */
export function validateCollection(
  pages: { file: string; data: unknown }[]
): PageIssue[] {
  const issues: PageIssue[] = []
  const seen = new Map<string, string>()

  for (const page of pages) {
    const id = (page.data as { id?: unknown } | null)?.id

    if (typeof id !== 'string' || !id) continue

    const existing = seen.get(id)

    if (existing) {
      issues.push({
        file: page.file,
        message: `duplicate id "${id}" — already used by ${existing}`
      })
    } else {
      seen.set(id, page.file)
    }
  }

  for (const page of pages) {
    const data = page.data as { subpages?: unknown } | null
    const subpages = data?.subpages

    if (!Array.isArray(subpages)) continue

    for (const childId of subpages) {
      if (typeof childId !== 'string' || seen.has(childId)) continue

      issues.push({
        file: page.file,
        message: `subpages references "${childId}", which no page declares as its id`
      })
    }
  }

  return issues
}
