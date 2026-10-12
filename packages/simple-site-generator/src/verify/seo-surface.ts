/**
 * Verify the SEO surface of built HTML.
 *
 * These are the checks that would have caught the original template's SEO
 * defect: it did produce meta tags in some configurations, but never asserted
 * anything about them, so a page could ship with no description, two titles, or
 * unparseable structured data and nothing noticed. Each check is a property a
 * crawler depends on.
 */

export interface SeoSurfaceIssue {
  /** Output file the problem was found in, e.g. `index.html`. */
  page: string
  message: string
}

export interface SeoSurfaceOptions {
  /** Site origin, used to assert the canonical is absolute. */
  siteUrl?: string
}

function countMatches(html: string, pattern: RegExp): number {
  return [...html.matchAll(pattern)].length
}

/**
 * Check one built page. Returns every problem found, so a broken build reports
 * all of its SEO faults at once rather than one per run.
 */
export function checkSeoSurface(
  html: string,
  page: string,
  options: SeoSurfaceOptions = {}
): SeoSurfaceIssue[] {
  const issues: SeoSurfaceIssue[] = []
  const add = (message: string) => issues.push({ page, message })

  // A page the site has deliberately marked `noindex` (the 404, for example) is
  // excluded from the index, so the tags that exist to describe an indexed page
  // — canonical, description, structured data — are not required of it. A title,
  // an h1 and a language still are: the page is rendered and read either way.
  const noindex =
    /<meta\b[^>]*\bname=["']?robots["']?[^>]*\bcontent=["'][^"']*noindex/i.test(
      html
    )

  // Exactly one <title>: two of them means a crawler picks one arbitrarily.
  const titleCount = countMatches(html, /<title\b[^>]*>[\s\S]*?<\/title>/gi)
  if (titleCount === 0) add('no <title>')
  if (titleCount > 1) add(`${titleCount} <title> tags — expected exactly one`)

  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim()
  if (titleCount === 1 && !title) add('<title> is empty')

  // Exactly one canonical, and it must be absolute.
  const canonical = [
    ...html.matchAll(/<link\b[^>]*\brel=["']?canonical["']?[^>]*>/gi)
  ]
  if (!noindex && canonical.length === 0) add('no canonical link')
  if (canonical.length > 1) {
    add(`${canonical.length} canonical links — expected exactly one`)
  }

  const canonicalHref = canonical[0]?.[0].match(/\bhref=["']([^"']+)["']/i)?.[1]
  if (canonical.length === 1 && !canonicalHref) {
    add('canonical link has no href')
  } else if (canonicalHref && !/^https?:\/\//i.test(canonicalHref)) {
    add(`canonical "${canonicalHref}" is not absolute`)
  } else if (canonicalHref && options.siteUrl) {
    const origin = options.siteUrl.replace(/\/+$/, '')
    if (!canonicalHref.startsWith(origin)) {
      add(`canonical "${canonicalHref}" is not on the configured site origin`)
    }
  }

  // A meta description is required on every indexable page.
  const description = html.match(
    /<meta\b[^>]*\bname=["']?description["']?[^>]*>/i
  )?.[0]
  const descriptionContent = description?.match(
    /\bcontent=["']([^"']*)["']/i
  )?.[1]

  if (!description) {
    if (!noindex) add('no meta description')
  } else if (!descriptionContent?.trim()) add('meta description is empty')

  // Structured data must exist and must be valid JSON — a syntax error there is
  // silently ignored by crawlers, so it has to be asserted.
  const jsonLdBlocks = [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    )
  ]

  if (jsonLdBlocks.length === 0 && !noindex) {
    add('no application/ld+json block')
  }

  for (const [index, block] of jsonLdBlocks.entries()) {
    try {
      JSON.parse(block[1])
    } catch (error) {
      add(
        `JSON-LD block ${index + 1} is not valid JSON: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  // Exactly one <h1>: the page template owns it, and content must not add one.
  const h1Count = countMatches(html, /<h1\b/gi)
  if (h1Count === 0) add('no <h1>')
  if (h1Count > 1) add(`${h1Count} <h1> tags — expected exactly one`)

  // <html> must declare a language for both crawlers and screen readers.
  const lang = html.match(/<html\b[^>]*\blang=["']([^"']*)["']/i)?.[1]
  if (!lang?.trim()) add('<html> has no lang attribute')

  return issues
}
