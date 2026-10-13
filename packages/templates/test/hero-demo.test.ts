import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import HeroDemo from '../src/shared/HeroDemo.vue'
import BusinessPage from '../src/business/Page.vue'
import Landing from '../src/landing/Landing.vue'
import { mountPageInShell, mountWithQuasar } from './support/mount.js'

/**
 * The hero graphic.
 *
 * The interesting properties are not "does it render" but: does the geometry
 * follow the declared stops, do two instances on one page stay independent (the
 * `<pattern>` and `<path>` are referenced by id, and a shared id would silently
 * make the second graphic draw the first one's route), and does the business
 * band choose *one* decoration rather than stacking a background image behind
 * the dot grid.
 */

const steps = ['Call', 'Survey', 'Quote', 'Install']

describe('hero demo graphic', () => {
  it('renders one labelled graphic, not a pile of decorative shapes', () => {
    const wrapper = mountWithQuasar(HeroDemo, {
      props: { steps, label: 'How we work' }
    })

    const figures = wrapper.findAll('[data-ssg="hero-demo"]')

    expect(figures).toHaveLength(1)
    expect(wrapper.find('svg').attributes('role')).toBe('img')
    expect(wrapper.find('svg').attributes('aria-label')).toBe('How we work')
  })

  it('falls back to the stop labels when no name is given', () => {
    const wrapper = mountWithQuasar(HeroDemo, {
      props: { steps: ['Call', 'Install'] }
    })

    expect(wrapper.find('svg').attributes('aria-label')).toBe(
      'Process: Call, Install'
    )
  })

  it('draws one ring and one dot per stop, and one label per stop', () => {
    const wrapper = mountWithQuasar(HeroDemo, { props: { steps } })

    expect(wrapper.findAll('.ssg-demo__dot')).toHaveLength(steps.length)
    expect(wrapper.findAll('.ssg-demo__ring')).toHaveLength(steps.length)

    const labels = wrapper.findAll('.ssg-demo__label')

    expect(labels.map((label) => label.text())).toEqual(steps)
  })

  it('anchors the edge labels inward so they are not clipped', () => {
    const wrapper = mountWithQuasar(HeroDemo, { props: { steps } })
    const labels = wrapper.findAll('.ssg-demo__label')

    expect(labels[0].attributes('text-anchor')).toBe('start')
    expect(labels.at(-1)?.attributes('text-anchor')).toBe('end')
    expect(labels[1].attributes('text-anchor')).toBe('middle')
  })

  it('normalises the route so the pulse needs no runtime measurement', () => {
    const wrapper = mountWithQuasar(HeroDemo, { props: { steps } })

    // SVG attribute names are case-sensitive and Vue preserves them; the
    // assertion is on the rendered markup rather than a parsed attribute because
    // an HTML parser would lower-case it.
    expect(wrapper.html()).toMatch(/pathLength="100"/)
    expect(wrapper.find('.ssg-demo__pulse').exists()).toBe(true)
  })

  it('fades the dot grid rather than clipping it flat', () => {
    const wrapper = mountWithQuasar(HeroDemo, { props: { steps } })
    const grid = wrapper.find('.ssg-demo__grid')

    // Without the mask the grid ends on a hard line of dots and reads as a
    // background texture that failed to tile.
    const maskId = wrapper.find('mask').attributes('id')
    const fadeId = wrapper.find('radialGradient').attributes('id')
    const dotsId = wrapper.find('pattern').attributes('id')

    expect(maskId).toBeTruthy()
    expect(grid.attributes('mask')).toBe(`url(#${maskId})`)
    expect(grid.attributes('fill')).toBe(`url(#${dotsId})`)
    expect(wrapper.find('mask rect').attributes('fill')).toBe(`url(#${fadeId})`)
  })

  it('gives two instances in one app independent ids', () => {
    // Not two separate mounts: `useId` numbers per app instance, so two
    // independently mounted apps both start at zero and would collide while
    // proving nothing. The risk being tested is two demos on one *page*, which
    // share an app — and a shared id there would silently make the second
    // graphic draw the first one's route.
    const Pair = defineComponent({
      name: 'HeroDemoPair',
      render: () => h('div', [h(HeroDemo, { steps }), h(HeroDemo, { steps })])
    })

    const wrapper = mountWithQuasar(Pair)
    const hrefs = wrapper
      .findAll('.ssg-demo__route')
      .map((route) => route.attributes('href'))

    expect(hrefs).toHaveLength(2)
    expect(new Set(hrefs).size).toBe(2)

    const patterns = wrapper
      .findAll('.ssg-demo__grid')
      .map((grid) => grid.attributes('fill'))

    expect(new Set(patterns).size).toBe(2)
  })

  it('renders nothing for fewer than two stops', () => {
    const none = mountWithQuasar(HeroDemo, { props: { steps: [] } })
    const one = mountWithQuasar(HeroDemo, { props: { steps: ['Call'] } })

    expect(none.find('[data-ssg="hero-demo"]').exists()).toBe(false)
    expect(one.find('[data-ssg="hero-demo"]').exists()).toBe(false)
  })
})

describe('business band decoration', () => {
  const base = {
    id: 'services/leaks',
    title: 'Leak repair',
    description: 'Same-day leak repair across Amsterdam.'
  }

  it('draws the demo in the band when the page declares one', () => {
    const wrapper = mountPageInShell(BusinessPage, {
      ...base,
      demo: { steps, label: 'How a repair works' }
    })

    const band = wrapper.find('.ssg-business__header')

    expect(band.exists()).toBe(true)
    expect(band.find('[data-ssg="hero-demo"]').exists()).toBe(true)
    expect(band.find('svg').attributes('aria-label')).toBe('How a repair works')
  })

  it('prefers the demo over the background illustration', () => {
    const wrapper = mountPageInShell(BusinessPage, {
      ...base,
      headerImage: '/images/pattern.svg',
      demo: { steps }
    })

    const style = wrapper.find('.ssg-business__header').attributes('style')

    // Both would paint in the band's right-hand third, and the illustration is a
    // background image, so it would show through the demo's dot grid.
    expect(style ?? '').not.toContain('background-image')
  })

  it('still uses the background illustration when there is no demo', () => {
    const wrapper = mountPageInShell(BusinessPage, {
      ...base,
      headerImage: '/images/pattern.svg'
    })

    const band = wrapper.find('.ssg-business__header')

    expect(band.attributes('style')).toContain('background-image')
    expect(band.find('[data-ssg="hero-demo"]').exists()).toBe(false)
  })

  it('narrows the copy column only when the graphic is present', () => {
    const withDemo = mountPageInShell(BusinessPage, {
      ...base,
      demo: { steps }
    })
    const withoutDemo = mountPageInShell(BusinessPage, base)

    expect(withDemo.find('.ssg-business__band-copy--narrow').exists()).toBe(
      true
    )
    expect(withoutDemo.find('.ssg-business__band-copy--narrow').exists()).toBe(
      false
    )
  })

  it('keeps exactly one h1 with the graphic in place', () => {
    const wrapper = mountPageInShell(BusinessPage, {
      ...base,
      demo: { steps }
    })

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe('Leak repair')
  })
})

describe('landing hero visual', () => {
  const page = {
    id: 'home',
    title: 'Fast websites',
    description: 'Static sites that stay simple.'
  }

  it('shows the demo when the page has no hero image', () => {
    const wrapper = mountPageInShell(Landing, {
      ...page,
      demo: { steps }
    })

    expect(wrapper.find('.ssg-hero__aside').exists()).toBe(true)
    expect(wrapper.find('[data-ssg="hero-demo"]').exists()).toBe(true)
  })

  it('prefers a real screenshot — the product beats a drawing of it', () => {
    const wrapper = mountPageInShell(Landing, {
      ...page,
      images: [{ name: 'App', src: '/images/app.png', caption: 'The app' }],
      demo: { steps }
    })

    expect(wrapper.find('.ssg-hero__image').exists()).toBe(true)
    expect(wrapper.find('[data-ssg="hero-demo"]').exists()).toBe(false)
  })

  it('renders no aside at all when there is neither', () => {
    const wrapper = mountPageInShell(Landing, page)

    // An empty aside would still claim its flex column and leave a gap beside
    // the copy.
    expect(wrapper.find('.ssg-hero__aside').exists()).toBe(false)
  })
})
