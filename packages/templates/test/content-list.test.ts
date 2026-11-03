import { describe, expect, it } from 'vitest'
import ContentList from '../src/shared/ContentList.vue'
import { mountWithQuasar } from './support/mount.js'

/**
 * The contact list's semantics.
 *
 * `q-list` renders `role="list"`, which allows only `listitem` children. The
 * heading was its first child, and every item with an `href` becomes an `<a>` —
 * Quasar keeps the implicit link role and gives it no `listitem` role — so a
 * list of links had no listitem children at all. Lighthouse reported it as
 * `aria-required-children` (accessibility 95) on a client contact page whose
 * page, the first site whose lists are entirely links. `ssg verify` did not catch
 * it: its Lighthouse pass covers one page.
 */

const list = {
  header: 'E-mail',
  items: [
    {
      overline: 'Algemeen',
      label: 'info@example.com',
      href: 'mailto:info@example.com',
      icon: { name: 'i-mdi-email' }
    }
  ]
}

describe('content list semantics', () => {
  it('keeps the heading out of the list role', () => {
    const wrapper = mountWithQuasar(ContentList, { props: { list } })
    const group = wrapper.find('[role="group"]')

    expect(group.exists()).toBe(true)
    // The heading is a sibling: inside `role="list"` it is an invalid child, and
    // that is what the audit flagged.
    expect(group.find('h2').exists()).toBe(false)
    expect(wrapper.find('h2').text()).toBe('E-mail')
  })

  it('labels the group with the heading it belongs to', () => {
    const wrapper = mountWithQuasar(ContentList, { props: { list } })
    const group = wrapper.find('[role="group"]')
    const heading = wrapper.find('h2')

    expect(group.attributes('role')).toBe('group')
    expect(group.attributes('aria-labelledby')).toBe(heading.attributes('id'))
    expect(heading.attributes('id')).toBeTruthy()
  })

  it('leaves the link a link', () => {
    const wrapper = mountWithQuasar(ContentList, { props: { list } })
    const link = wrapper.find('a')

    expect(link.attributes('href')).toBe('mailto:info@example.com')
    // A `listitem` role here would remove the link role — which is the reason the
    // fix is on the container, not on the item.
    expect(link.attributes('role')).toBeUndefined()
  })

  it('renders no group label when the list has no heading', () => {
    const wrapper = mountWithQuasar(ContentList, {
      props: { list: { items: list.items } }
    })

    expect(wrapper.find('h2').exists()).toBe(false)
    expect(
      wrapper.find('[role="group"]').attributes('aria-labelledby')
    ).toBeUndefined()
  })
})
