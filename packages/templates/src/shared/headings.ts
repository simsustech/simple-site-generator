/**
 * Shift every ATX markdown heading down one level (`#` → `##`, `##` → `###`).
 *
 * The page shell or hero owns the document's single `<h1>`; content headings
 * must start at `<h2>` or the heading order skips a level and fails
 * accessibility audits. Fenced code blocks are left untouched so a `#` inside a
 * code sample is not rewritten.
 */
export function demoteHeadings(markdown: string): string {
  let inFence = false
  let fenceMarker = ''

  return markdown
    .split('\n')
    .map((line) => {
      const fence = line.match(/^\s*(`{3,}|~{3,})/)

      if (fence) {
        if (!inFence) {
          inFence = true
          fenceMarker = fence[1][0]
        } else if (fence[1][0] === fenceMarker) {
          inFence = false
          fenceMarker = ''
        }

        return line
      }

      if (inFence) return line

      // Only ATX headings (`#` … `######`) at the start of a line, and never a
      // setext underline.
      return line.replace(/^(#{1,5})(\s+\S)/, '#$1$2')
    })
    .join('\n')
}

/**
 * The same guarantee for HTML, which is what `PageContent` actually receives:
 * `vite-plugin-markdown` renders the Markdown at build time, so the page module
 * carries HTML, not Markdown.
 *
 * An `h1` in the body is the whole defect — the shell already emits the
 * document's single `<h1>` — so this only raises `h1` to `h2` and leaves the
 * rest alone. Shifting *every* level would take an author's `##` to `h3` and
 * skip a level, which fails the same audit from the other side.
 */
export function demoteH1(html: string): string {
  return html.replace(
    /<(\/?)h1(\s|>)/g,
    (_, closing: string, tail: string) => `<${closing}h2${tail}`
  )
}
