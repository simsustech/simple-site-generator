import type { SitePage } from './types.js'

/**
 * Navigation logic, kept pure so it can be asserted directly rather than by
 * driving Quasar's lazily-rendered menus.
 *
 * Quasar's `q-menu` does not render its contents until it is opened, so a test
 * that reads the rendered HTML of a dropdown cannot see its items. The
 * resolution rules — which pages are in the menu, and which `subpages` ids
 * actually resolve — are the parts worth testing, and they are pure.
 */

/** Pages tagged `menu`, in the order the app supplied them. */
export function menuPagesOf(pages: SitePage[] | undefined): SitePage[] {
  return (pages ?? []).filter((page) => page.tags?.includes('menu'))
}

/** Pages tagged `contact`. */
export function contactPagesOf(pages: SitePage[] | undefined): SitePage[] {
  return (pages ?? []).filter((page) => page.tags?.includes('contact'))
}

/** Pages tagged `footer`. */
export function footerPagesOf(pages: SitePage[] | undefined): SitePage[] {
  return (pages ?? []).filter((page) => page.tags?.includes('footer'))
}

/**
 * Resolve a page's `subpages` ids to the pages themselves.
 *
 * `subpages` is declared as ids in frontmatter so a typo produces one obvious
 * broken reference instead of a duplicated page object that can drift. Ids that
 * resolve to nothing are dropped rather than rendered as a dead link.
 */
export function subpagesOf(
  page: SitePage,
  pages: SitePage[] | undefined
): SitePage[] {
  return (page.subpages ?? [])
    .map((id) => (pages ?? []).find((candidate) => candidate.id === id))
    .filter((candidate): candidate is SitePage => Boolean(candidate))
}

/** Full route path for a page: the home page is the root, everything else is `/{id}`. */
export function pathOf(page: SitePage): string {
  return page.id === 'home' ? '/' : `/${page.id}`
}
