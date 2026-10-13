import { describe, expect, it } from 'vitest'
import { demoteHeadings, demoteH1 } from '../src/shared/headings.js'

/**
 * The page shell or hero owns the document's single `<h1>`; markdown headings
 * must start at `<h2>` or the heading order skips a level (Lighthouse
 * `heading-order`). This is the pure function that makes that true.
 */
describe('demoteHeadings', () => {
  it('shifts ATX headings down one level', () => {
    expect(demoteHeadings('# Title')).toBe('## Title')
    expect(demoteHeadings('## Section')).toBe('### Section')
    expect(demoteHeadings('##### Deep')).toBe('###### Deep')
  })

  it('leaves an h6 alone, since there is no h7', () => {
    expect(demoteHeadings('###### Deepest')).toBe('###### Deepest')
  })

  it('leaves prose and non-heading hashes untouched', () => {
    expect(demoteHeadings('plain text')).toBe('plain text')
    expect(demoteHeadings('a # hash mid-line')).toBe('a # hash mid-line')
    // A line that only contains hashes is not a heading.
    expect(demoteHeadings('###')).toBe('###')
  })

  it('preserves heading text and surrounding lines', () => {
    const input = ['intro', '', '# Title', '', 'body'].join('\n')

    expect(demoteHeadings(input)).toBe(
      ['intro', '', '## Title', '', 'body'].join('\n')
    )
  })

  it('does not rewrite hashes inside fenced code blocks', () => {
    const input = [
      '# Real heading',
      '',
      '```bash',
      '# a shell comment, not a heading',
      'echo hi',
      '```',
      '',
      '## Another real heading'
    ].join('\n')

    expect(demoteHeadings(input)).toBe(
      [
        '## Real heading',
        '',
        '```bash',
        '# a shell comment, not a heading',
        'echo hi',
        '```',
        '',
        '### Another real heading'
      ].join('\n')
    )
  })

  it('handles tilde fences and nested fences independently', () => {
    const input = ['~~~', '# kept', '~~~', '', '# demoted'].join('\n')

    expect(demoteHeadings(input)).toBe(
      ['~~~', '# kept', '~~~', '', '## demoted'].join('\n')
    )
  })
})

describe('demoteH1', () => {
  it('raises an h1 to h2, opening and closing tag together', () => {
    expect(demoteH1('<h1 id="a">Title</h1>')).toBe('<h2 id="a">Title</h2>')
    expect(demoteH1('<h1>Title</h1>')).toBe('<h2>Title</h2>')
  })

  it('leaves every other level exactly where the author put it', () => {
    // Shifting all levels would take `##` to `h3` and skip a level — the same
    // audit failure, from the other side.
    expect(demoteH1('<h2>Section</h2>')).toBe('<h2>Section</h2>')
    expect(demoteH1('<h3>Sub</h3>')).toBe('<h3>Sub</h3>')
    expect(demoteH1('<h6>Deepest</h6>')).toBe('<h6>Deepest</h6>')
  })

  it('is idempotent, because the result is a valid input', () => {
    const once = demoteH1('<h1>A</h1><h2>B</h2>')

    expect(demoteH1(once)).toBe(once)
  })

  it('leaves text that merely mentions a tag alone', () => {
    expect(demoteH1('<p>use h1 for the title</p>')).toBe(
      '<p>use h1 for the title</p>'
    )
    expect(demoteH1('<code>&lt;h1&gt;</code>')).toBe('<code>&lt;h1&gt;</code>')
  })
})
