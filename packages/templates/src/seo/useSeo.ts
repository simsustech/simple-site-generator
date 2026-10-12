import { useMeta } from 'quasar'
import type { SeoContext, SeoPage } from '../shared/types.js'
import { buildMeta } from './meta.js'

/**
 * Apply the page's `<head>` tags.
 *
 * Called from the **layout** (`SiteShell`), never from a page component. The
 * layout is the one component guaranteed to run on every route: a page marked
 * `noSsr` is wrapped in `QNoSsr` and a lazily-resolved page component is not
 * collected during prerender, so a `useMeta` living in the page would silently
 * emit nothing for exactly those pages.
 *
 * All real logic lives in the pure `buildMeta`; this is the Quasar binding.
 */
export function useSeo(
  page: SeoPage | undefined,
  site: SeoContext,
  path: string
): void {
  useMeta(buildMeta({ page, site, path }))
}
