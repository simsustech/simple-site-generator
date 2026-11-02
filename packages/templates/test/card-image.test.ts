import { describe, expect, it } from 'vitest'
import BentoGrid from '../src/shared/BentoGrid.vue'
import BusinessPage from '../src/business/Page.vue'
import { mountPageInShell, mountWithQuasar } from './support/mount.js'

/**
 * Card photos — a catalogue card is a picture of a thing.
 *
 * The properties worth pinning are the ones an icon could not provide and the
 * ones a broken implementation would lose silently: the photo is an `<img>` with
 * a real accessible name, its space is reserved before the bytes arrive (so a
 * grid of 40 photos does not reflow as it loads), and the ratio comes from the
 * authored size rather than from whatever a landscape default would crop to.
 */

const portrait = {
  src: '/images/rosa-grand-select.webp',
  width: 675,
  height: 900
}

const tiles = [
  {
    header: 'Rosa Grand Select',
    content: 'VBN 324091 · Rood · 70-80 · Apr-Mei',
    image: portrait
  },
  { header: 'Contact', content: 'Bel ons.' }
]

describe('card images', () => {
  it('renders the photo above the tile heading', () => {
    const wrapper = mountWithQuasar(BentoGrid, { props: { tiles } })
    const tile = wrapper.findAll('.ssg-bento__tile')[0]

    const figure = tile.find('.ssg-bento__media')
    const heading = tile.find('.ssg-bento__tile-header')

    expect(figure.exists()).toBe(true)
    expect(
      figure.element.compareDocumentPosition(heading.element) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it('names the photo, falling back to the card header', () => {
    const wrapper = mountWithQuasar(BentoGrid, {
      props: {
        tiles: [
          tiles[0],
          { ...tiles[0], header: 'Rosa Navy', image: { src: 'x.webp' } }
        ]
      }
    })
    const images = wrapper.findAll('.ssg-bento__image')

    // An `alt` that is present wins; without one the header is the honest name,
    // because it is what the card says the picture is. An empty `alt` would mark
    // a catalogue photo as decoration, which it is not.
    expect(images[0].attributes('alt')).toBe('Rosa Grand Select')
    expect(images[1].attributes('alt')).toBe('Rosa Navy')
  })

  it('reserves the authored ratio, so nothing below the grid moves', () => {
    const wrapper = mountWithQuasar(BentoGrid, { props: { tiles } })
    const figure = wrapper.find('.ssg-bento__media')
    const image = wrapper.find('.ssg-bento__image')

    // The ratio lives on the wrapper because the wrapper exists before the file
    // does; the `<img>` fills it.
    expect(figure.attributes('style')).toContain('675 / 900')

    // Explicit dimensions are what let the browser reserve the box even if the
    // stylesheet is still loading.
    expect(image.attributes('width')).toBe('675')
    expect(image.attributes('height')).toBe('900')
  })

  it('falls back to the design system ratio when the size is not declared', () => {
    const wrapper = mountWithQuasar(BentoGrid, {
      props: { tiles: [{ ...tiles[0], image: { src: 'x.webp' } }] }
    })

    // No inline ratio: `ssg-bento__media` carries `aspect-ratio: 4/3`.
    expect(
      wrapper.find('.ssg-bento__media').attributes('style')
    ).toBeUndefined()
  })

  it('lazy-loads every photo, and does not fetch one for a card without one', () => {
    const wrapper = mountWithQuasar(BentoGrid, { props: { tiles } })
    const images = wrapper.findAll('.ssg-bento__image')

    expect(images).toHaveLength(1)
    expect(images[0].attributes('loading')).toBe('lazy')
    expect(images[0].attributes('decoding')).toBe('async')
  })

  it('shows a photo whole inside its plate when the card asks for contain', () => {
    const wrapper = mountWithQuasar(BentoGrid, {
      props: {
        tiles: [
          { ...tiles[0], image: { ...portrait, fit: 'contain' as const } },
          tiles[0]
        ]
      }
    })
    const images = wrapper.findAll('.ssg-bento__image')

    // `cover` stays the default: a card that says nothing crops, as before.
    expect(images[0].classes()).toContain('ssg-bento__image--contain')
    expect(images[1].classes()).not.toContain('ssg-bento__image--contain')
  })

  it('carries a card image through the business page', () => {
    const wrapper = mountPageInShell(BusinessPage, {
      id: 'assortiment',
      title: 'Assortiment',
      description: 'Ons assortiment.',
      cards: tiles
    })

    expect(wrapper.find('.ssg-bento__image').attributes('src')).toBe(
      portrait.src
    )
  })
})
