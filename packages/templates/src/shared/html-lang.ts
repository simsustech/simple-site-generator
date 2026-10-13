/**
 * `<html lang>` handling.
 *
 * Quasar's Lang plugin owns the attribute: its Meta plugin filters `lang` and
 * `dir` out of `htmlAttr` (`htmlFilter` in quasar/src/plugins/meta), so the SEO
 * layer's `lang` cannot set it — and a page-level `lang` therefore has to be
 * written through the same field Quasar writes.
 *
 * That field is `ssrContext._meta.htmlAttrs`, which vitrify's Quasar plugin
 * injects into the `<html>` tag of the prerendered document. Writing it here
 * rather than swapping Quasar's language pack keeps the pack (and its whole UI
 * string table) out of the bundle: on a site whose UI strings are English
 * literals in the templates, the pack would cost several kilobytes on *every*
 * page to fix one attribute.
 *
 * Pure so it can be asserted directly — the SSR path can only be exercised
 * through a real prerender, which is exactly the kind of thing that silently
 * rots.
 */

/** Replace the `lang` value in an existing attribute string, or append one. */
export function withLang(attrs: string, lang: string): string {
  return /(^|\s)lang=/.test(attrs)
    ? attrs.replace(/(^|\s)lang=[^\s]*/, `$1lang=${lang}`)
    : `${attrs} lang=${lang}`.trim()
}
