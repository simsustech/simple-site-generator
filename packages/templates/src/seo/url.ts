/**
 * Join a site origin and a route path into an absolute URL.
 *
 * Canonical tags, OpenGraph URLs and sitemap `<loc>` values all go through here
 * so trailing-slash and duplicate-slash drift cannot make one page look like two
 * different URLs to a crawler.
 */
export function absoluteUrl(base: string, path: string): string {
  const origin = base.replace(/\/+$/, '')
  const suffix = path === '/' ? '/' : `/${path.replace(/^\/+/, '')}`

  return `${origin}${suffix}`
}
