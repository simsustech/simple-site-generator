import { describe, expect, it } from 'vitest'
import DocsPage from '../src/docs/Page.vue'
import { mountPageInShell } from './support/mount.js'

/**
 * Seam S2 — the template render.
 *
 * Every page is mounted inside the shell, exactly as the app renders it: a
 * `q-page` outside a `q-page-container` renders nothing, so mounting the page
 * alone would assert against an empty DOM.
 *
 * The docs page is the reference case for the shared page contract: the page
 * owns the document's single `<h1>`, the description becomes a lede, and
 * structured content renders in the body.
 */
function mountDocsPage(pageProps: Record<string, unknown>) {
  return mountPageInShell(DocsPage, { id: 'guides', ...pageProps })
}

describe('docs template page', () => {
  it('renders the page title as the only h1', () => {
    const wrapper = mountDocsPage({ title: 'Guides', label: 'Guides' })

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe('Guides')
  })

  it('renders the description as a lede', () => {
    const wrapper = mountDocsPage({
      title: 'Guides',
      description: 'Everything you need to get started'
    })

    expect(wrapper.find('.ssg-docs__lede').text()).toBe(
      'Everything you need to get started'
    )
  })

  it('omits the lede when there is no description', () => {
    const wrapper = mountDocsPage({ title: 'Guides' })

    expect(wrapper.find('.ssg-docs__lede').exists()).toBe(false)
  })

  it('renders no second h1 even when the markdown body starts with one', () => {
    // `PageContent` demotes markdown headings, so a `# Body` in the content must
    // not produce a competing h1.
    const wrapper = mountDocsPage({
      title: 'Guides',
      content: '# Body heading'
    })

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe('Guides')
  })

  it('renders list content from the frontmatter contract', () => {
    const wrapper = mountDocsPage({
      title: 'Guides',
      lists: [
        {
          header: 'Next steps',
          items: [{ label: 'Install', caption: 'npm i' }]
        }
      ]
    })

    expect(wrapper.text()).toContain('Next steps')
    expect(wrapper.text()).toContain('Install')
    expect(wrapper.text()).toContain('npm i')
  })
})
