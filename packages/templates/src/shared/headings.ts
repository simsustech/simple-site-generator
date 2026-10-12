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
