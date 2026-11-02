import { describe, expect, it } from 'vitest'
import PlainPage from '../src/plain/Page.vue'
import { mountPageInShell } from './support/mount.js'

/**
 * The plain template's hero photograph reserves its box.
 *
 * An `<img>` with no `width`/`height` is 0px tall until it decodes, so every
 * element below it jumps down when it lands. Measured with the photo held back
 * 1.2s on a built site: the figure went from 0px to 190px at 360 wide and to
 * 300px at 1280, for CLS 0.157 and 0.016 — 35 times the header-height shift this
 * kit already fixed. The fix is the numbers on the element, not a skeleton: the
 * photo's size is known when the page is authored, so the box can be reserved
 * before the bytes arrive.
 *
 * The size travels in `headerImageWidth`/`headerImageHeight` rather than in the
 * `headerImage` string, because sites copy this markup: a site that kept its own
 * copy of the hero broke the day `headerImage` stopped being a URL. The last test
 * pins that shape — a bare URL still renders — so the same edit cannot silently
 * empty every copied hero.
 */

const page = {
  id: 'home',
  title: 'Cameramast huren',
  description: 'Een mobiele cameramast op locatie, met stroom en data.'
}

describe('plain template hero reservation', () => {
  it('falls back to a landscape box when the page declares only a URL', () => {
    const wrapper = mountPageInShell(PlainPage, {
      ...page,
      headerImage: '/images/hero.webp'
    })
    const img = wrapper.find('img.ssg-plain__hero-img')

    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/images/hero.webp')
    expect(img.attributes('width')).toBe('1200')
    expect(img.attributes('height')).toBe('750')
  })

  it("reserves the photo's own ratio when the page declares its size", () => {
    const wrapper = mountPageInShell(PlainPage, {
      ...page,
      headerImage: '/images/cameramast-op-locatie.webp',
      headerImageWidth: 1156,
      headerImageHeight: 721
    })
    const img = wrapper.find('img.ssg-plain__hero-img')

    expect(img.attributes('src')).toBe('/images/cameramast-op-locatie.webp')
    expect(img.attributes('width')).toBe('1156')
    expect(img.attributes('height')).toBe('721')
  })

  it('renders no hero at all when the page declares none', () => {
    const wrapper = mountPageInShell(PlainPage, { ...page })

    expect(wrapper.find('img.ssg-plain__hero-img').exists()).toBe(false)
  })
})
