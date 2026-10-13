import { describe, expect, it } from 'vitest'
import { isIgnored } from '../src/verify/ignore.js'
import { checkSeoSurface } from '../src/verify/seo-surface.js'

/**
 * Regression tests for the two verifier defects found while building the
 * simsustech website on the kit:
 *
 *   1. the SEO surface counted tags inside HTML comments, so a page whose head
 *      was entirely commented out — which really happened — passed;
 *   2. a third-party `.html` drop-in (a Google site-verification file) has no
 *      title/canonical/description and cannot be a page, so it must be
 *      excludable.
 */

const valid = `<!doctype html>
<html lang="en-GB">
  <head>
    <title>About · Acme</title>
    <meta name="description" content="About Acme.">
    <link rel="canonical" href="https://acme.test/about">
    <script type="application/ld+json">{"@context":"https://schema.org"}</script>
  </head>
  <body><main><h1>About</h1></main></body>
</html>`

describe('checkSeoSurface', () => {
  it('accepts a page with one title, one description, one canonical and one h1', () => {
    expect(checkSeoSurface(valid, 'about.html')).toEqual([])
  })

  it('ignores tag-shaped text inside HTML comments', () => {
    // The app template's own comment mentions `h1`, which used to be counted as
    // a second heading and failed a correct page.
    const withComment = valid.replace(
      '<body>',
      '<body><!-- the page owns the single <h1>; content starts at h2 -->'
    )

    expect(checkSeoSurface(withComment, 'about.html')).toEqual([])
  })

  it('does not accept a title that only exists inside a comment', () => {
    // This is the real defect: vitrify's head rewrite matched a `<title>` in an
    // index.html comment and left every injected tag inside the comment.
    const commented = `<!doctype html>
<html lang="en-GB">
  <head><!-- <title>About · Acme</title> --></head>
  <body><main><h1>About</h1></main></body>
</html>`

    expect(checkSeoSurface(commented, 'about.html')).toContainEqual({
      page: 'about.html',
      message: 'no <title>'
    })
  })

  it('reports every missing tag at once, not just the first', () => {
    const bare = '<!doctype html><html><head></head><body></body></html>'
    const messages = checkSeoSurface(bare, 'bare.html').map(
      (issue) => issue.message
    )

    expect(messages).toContain('no <title>')
    expect(messages).toContain('no canonical link')
    expect(messages).toContain('no meta description')
    expect(messages).toContain('no application/ld+json block')
    expect(messages).toContain('no <h1>')
    expect(messages).toContain('<html> has no lang attribute')
  })
})

describe('isIgnored', () => {
  it('matches a top-level verification file by glob', () => {
    expect(isIgnored('google8974b7b90b81585d.html', ['google*.html'])).toBe(
      true
    )
  })

  it('does not match an app page', () => {
    expect(isIgnored('index.html', ['google*.html'])).toBe(false)
    expect(isIgnored('nl/about.html', ['google*.html'])).toBe(false)
  })

  it('ignores nothing when no patterns are given', () => {
    expect(isIgnored('index.html', [])).toBe(false)
  })
})
