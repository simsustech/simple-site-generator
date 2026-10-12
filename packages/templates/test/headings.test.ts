import { describe, expect, it } from 'vitest'
import { demoteHeadings } from '../src/shared/headings.js'

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
