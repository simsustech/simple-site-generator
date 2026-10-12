import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Smoke from './fixtures/Smoke.vue'

/**
 * Harness proof for step 0.
 *
 * Seam S2 (template render) requires three capabilities from the test runner:
 *   1. a `.vue` SFC is compiled by `@vitejs/plugin-vue`,
 *   2. it mounts in a DOM environment (`happy-dom`),
 *   3. `@vue/test-utils` can query the rendered output.
 *
 * This spec asserts exactly those three, so every later component test can rely
 * on them without re-proving the harness.
 */
describe('test harness', () => {
  it('compiles and mounts a .vue SFC and exposes its rendered DOM', () => {
    const wrapper = mount(Smoke, {
      props: { title: 'Harness', body: 'mounted' }
    })

    expect(wrapper.find('[data-ssg="smoke"]').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('Harness')
    expect(wrapper.find('p').text()).toBe('mounted')
  })

  it('renders per-prop output, so assertions can target real behaviour', () => {
    const first = mount(Smoke, { props: { title: 'first', body: 'a' } })
    const second = mount(Smoke, { props: { title: 'second', body: 'b' } })

    expect(first.find('h1').text()).toBe('first')
    expect(second.find('h1').text()).toBe('second')
    expect(second.find('p').text()).toBe('b')
  })
})
