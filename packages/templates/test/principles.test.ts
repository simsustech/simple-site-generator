import { describe, expect, it } from 'vitest'
import PrincipleGrid from '../src/shared/PrincipleGrid.vue'
import BusinessPage from '../src/business/Page.vue'
import { mountPageInShell, mountWithQuasar } from './support/mount.js'

/**
 * The principles band — the markup replacement for `philosophy.svg`.
 *
 * The properties worth pinning are the ones an illustration could never have:
 * the text is real text (so it is selectable, translatable and searchable), the
 * list carries its own order semantically, and the visible number does not make a
 * screen reader read each position twice.
 */

const items = [
  { title: 'Simple by default', text: 'The smallest stack that solves it.' },
  { title: 'Sustainable', text: 'Open standards, no single vendor.' },
  { title: 'Accessible', text: 'Semantic and keyboard-navigable.' },
  { title: 'Cooperative', text: 'You keep the code and the domain.' }
]

describe('principles band', () => {
  it('renders the items as real, selectable text', () => {
    const wrapper = mountWithQuasar(PrincipleGrid, { props: { items } })

    expect(wrapper.find('[data-ssg="principles"]').exists()).toBe(true)
    expect(wrapper.findAll('.ssg-principles__item')).toHaveLength(4)

    for (const item of items) {
      expect(wrapper.text()).toContain(item.title)
      expect(wrapper.text()).toContain(item.text)
    }
  })

  it('uses an ordered list, so the order is in the semantics', () => {
    const wrapper = mountWithQuasar(PrincipleGrid, { props: { items } })

    expect(wrapper.find('ol.ssg-principles__list').exists()).toBe(true)
    expect(wrapper.findAll('ol > li')).toHaveLength(4)
  })

  it('hides the visible number from assistive tech', () => {
    const wrapper = mountWithQuasar(PrincipleGrid, { props: { items } })
    const marks = wrapper.findAll('.ssg-principles__mark')

    // The `<ol>` already announces position; a readable number here would make
    // every item announce "1 one, 2 two" instead of "1 of 4".
    expect(marks).toHaveLength(4)
    expect(
      marks.every((mark) => mark.attributes('aria-hidden') === 'true')
    ).toBe(true)
    expect(marks.map((mark) => mark.text())).toEqual(['1', '2', '3', '4'])
  })

  it('renders the section heading as h2 and each item as h3', () => {
    const wrapper = mountWithQuasar(PrincipleGrid, {
      props: { items, heading: 'Simple, sustainable technology' }
    })

    // The page owns the `<h1>`, so the band starts at h2 and its cards at h3 —
    // an h3 under an h1 would be a skipped level.
    expect(wrapper.findAll('h2')).toHaveLength(1)
    expect(wrapper.findAll('h3')).toHaveLength(4)
  })

  it('omits the header block when there is no heading or leading', () => {
    const wrapper = mountWithQuasar(PrincipleGrid, { props: { items } })

    expect(wrapper.find('.ssg-principles__header').exists()).toBe(false)
  })

  it('renders nothing when there are no items', () => {
    const wrapper = mountWithQuasar(PrincipleGrid, { props: { items: [] } })

    // An empty `<section>` still takes the band's top margin and leaves a gap.
    expect(wrapper.find('[data-ssg="principles"]').exists()).toBe(false)
  })
})

describe('business template principles', () => {
  const base = { id: 'home', title: 'Home', description: 'Home page.' }

  it('renders the band between the prose and the service cards', () => {
    const wrapper = mountPageInShell(BusinessPage, {
      ...base,
      content: '<p>Body copy.</p>',
      principles: { heading: 'How we choose', items },
      cards: [{ header: 'Websites', content: 'Static sites.' }]
    })

    const html = wrapper.html()
    const prose = html.indexOf('ssg-content__markdown')
    const band = html.indexOf('data-ssg="principles"')
    const cards = html.indexOf('ssg-business__cards')

    expect(prose).toBeGreaterThan(-1)
    expect(band).toBeGreaterThan(prose)
    expect(cards).toBeGreaterThan(band)
  })

  it('renders nothing when the page declares no principles', () => {
    const wrapper = mountPageInShell(BusinessPage, base)

    expect(wrapper.find('[data-ssg="principles"]').exists()).toBe(false)
  })

  it('keeps exactly one h1 with the band present', () => {
    const wrapper = mountPageInShell(BusinessPage, {
      ...base,
      principles: { items }
    })

    expect(wrapper.findAll('h1')).toHaveLength(1)
  })
})
