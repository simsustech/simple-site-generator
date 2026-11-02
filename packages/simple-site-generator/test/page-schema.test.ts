import { describe, expect, it } from 'vitest'
import { bodyWarnings, validatePage } from '../src/pages/page-schema.js'

/**
 * The frontmatter contract, focused on the `demo` field the hero graphic reads.
 *
 * This matters more than a normal field test because the templates degrade
 * *silently*: an unknown or malformed `demo` does not throw, it simply renders
 * nothing, and the only place that becomes visible is the live site. The schema
 * is the one place the mistake can be caught.
 */

const minimal = {
  id: 'about',
  title: 'About',
  description: 'About Acme.'
}

describe('page frontmatter schema', () => {
  it('accepts a page with no demo at all', () => {
    expect(validatePage('About.md', minimal)).toEqual([])
  })

  it('accepts a demo with two or more stops', () => {
    const issues = validatePage('Index.md', {
      ...minimal,
      demo: {
        steps: ['Write Markdown', 'Build', 'Deploy'],
        label: 'From Markdown to a deployed site'
      }
    })

    expect(issues).toEqual([])
  })

  it('accepts a demo with no label — the graphic names itself from the stops', () => {
    expect(
      validatePage('Index.md', {
        ...minimal,
        demo: { steps: ['Call', 'Install'] }
      })
    ).toEqual([])
  })

  it('rejects a single stop, which is a dot rather than a process', () => {
    const issues = validatePage('Index.md', {
      ...minimal,
      demo: { steps: ['Call'] }
    })

    expect(issues).toHaveLength(1)
    expect(issues[0].file).toBe('Index.md')
    expect(issues[0].message).toBe(
      'demo.steps: Too small: expected array to have >=2 items'
    )
  })

  it('rejects an empty stop list', () => {
    expect(
      validatePage('Index.md', { ...minimal, demo: { steps: [] } })
    ).not.toEqual([])
  })

  it('rejects a blank stop, which would draw an unlabelled dot', () => {
    expect(
      validatePage('Index.md', {
        ...minimal,
        demo: { steps: ['Call', ''] }
      })
    ).not.toEqual([])
  })

  it('rejects a demo that is not an object', () => {
    // The shape a generator most plausibly gets wrong: a bare list of stops.
    expect(
      validatePage('Index.md', { ...minimal, demo: ['Call', 'Build'] })
    ).not.toEqual([])
  })

  it('rejects a principles band with no items', () => {
    expect(
      validatePage('Index.md', { ...minimal, principles: { items: [] } })
    ).not.toEqual([])
  })

  it('rejects a card missing its text, which would render an empty box', () => {
    expect(
      validatePage('Index.md', {
        ...minimal,
        principles: { items: [{ title: 'Simple by default' }] }
      })
    ).not.toEqual([])
  })

  it('accepts a principles band with heading, items and note', () => {
    expect(
      validatePage('Index.md', {
        ...minimal,
        principles: {
          heading: 'Simple, sustainable technology',
          leading: 'Four rules, applied before choosing anything.',
          items: [
            { title: 'Simple by default', text: 'The smallest stack.' },
            { title: 'Sustainable', text: 'Open standards.' }
          ],
          note: 'Each rule removes work later.'
        }
      })
    ).toEqual([])
  })

  it('rejects a page with no id, which has no route', () => {
    const issues = validatePage('Index.md', {
      title: 'About',
      description: 'About Acme.'
    })

    expect(issues.some((issue) => issue.message.startsWith('id'))).toBe(true)
  })

  it('warns when the body opens with the page title as a heading', () => {
    // Measured on the reference site: 22 of 38 pages opened with `## Products`
    // under an `<h1>Products</h1>`, because the template renders `title` above
    // the markdown and the author wrote the title again below it. One `<h1>` and
    // one legal `<h2>` — invisible to `tsc`, to the SEO surface check and to the
    // reader who assumes it is a section.
    const warnings = bodyWarnings(
      'Products/Products.md',
      '\n## Products\n\nAlongside client work we build our own products.\n',
      { ...minimal, title: 'Products' }
    )

    expect(warnings).toHaveLength(1)
    expect(warnings[0].message).toContain('"Products"')
    expect(warnings[0].message).toContain('repeats the page')
  })

  it('compares the heading with the label too, and ignores emphasis and case', () => {
    const warnings = bodyWarnings(
      'Website.md',
      '\n## **websites**\n\nText.\n',
      {
        ...minimal,
        title: 'Websites',
        label: 'Website'
      }
    )

    expect(warnings).toHaveLength(1)
  })

  it('stays quiet when the first heading is a real section', () => {
    expect(
      bodyWarnings('Services.md', '\n## What we do\n\nText.\n', {
        ...minimal,
        title: 'Services'
      })
    ).toEqual([])
  })

  it('only looks at the first heading, not every heading', () => {
    // A page may name a later section after itself without printing the title
    // twice; what matters is whether the first thing under the title repeats it.
    expect(
      bodyWarnings(
        'Process.md',
        '\n## What we do\n\nText.\n\n## Products\n\nMore.\n',
        { ...minimal, title: 'Products' }
      )
    ).toEqual([])
  })
})
