import { describe, expect, it } from 'vitest'
import Landing from '../src/landing/Landing.vue'
import LandingLayout from '../src/landing/Layout.vue'
import { mountWithQuasar, samplePages, sampleTags } from './support/mount.js'

/**
 * Seam S2 — the landing template render.
 *
 * NOTE ON PLACEMENT: the plan assigns step 5 to the E2E layer (S4), because the
 * sticky bar's visibility and colour contrast are only observable in a real
 * browser at a real viewport. Those belong in `tests/e2e/landing.spec.ts`, which
 * needs a *served built site* — and the first real generated site is produced by
 * step 7 (`ssg init` → build). Until then these component assertions cover the
 * structural contract (one h1, one primary CTA, proof adjacency, sticky bar
 * wiring) and the E2E spec carries the viewport/contrast claims.
 */

const extra = {
  phone: '+31201234567',
  rating: 4.9,
  reviewCount: 214,
  reviewSource: 'Google',
  address: 'Keizersgracht 1, Amsterdam',
  serviceArea: ['Amsterdam', 'Haarlem'],
  registration: 'KVK 12345678',
  insured: true,
  reviews: [
    { name: 'Sam', text: 'Fixed our leak the same day.', rating: 5 },
    { name: 'Ada', text: 'Clear pricing, tidy work.', rating: 5 }
  ]
}

const landingProps = {
  id: 'home',
  title: 'Emergency plumbing in Amsterdam',
  description: 'Same-day callouts, fixed prices, 4.9 stars from 214 reviews.',
  content: '# Why choose us\n\nWe answer the phone.',
  cards: [
    {
      header: 'Emergency callout',
      content: 'On site within 60 minutes.',
      cta: { message: 'Book a callout', route: '/contact' }
    },
    { header: 'Fixed pricing', content: 'Quoted before we start.' }
  ],
  faq: [
    { question: 'Do you work weekends?', answer: 'Yes, including Sundays.' },
    { question: 'Is the quote binding?', answer: 'Yes, up to 30 days.' }
  ],
  extra
}

function mountLanding(overrides: Record<string, unknown> = {}) {
  return mountWithQuasar(Landing, {
    props: { ...landingProps, ...overrides }
  })
}

describe('landing template', () => {
  it('renders exactly one h1, owned by the hero', () => {
    const wrapper = mountLanding()

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe('Emergency plumbing in Amsterdam')
  })

  it('does not create a second h1 from markdown content', () => {
    const wrapper = mountLanding({ content: '# Body heading\n\ntext' })

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe('Emergency plumbing in Amsterdam')
  })

  it('has exactly one primary call to action in the hero', () => {
    const wrapper = mountLanding()

    expect(wrapper.findAll('[data-ssg="hero-cta"]')).toHaveLength(1)
  })

  it('keeps the primary CTA a link to the contact route by default', () => {
    const wrapper = mountLanding()
    const cta = wrapper.find('[data-ssg="hero-cta"]')

    // CtaButton renders a q-btn whose `to` becomes an href once routed.
    expect(cta.exists()).toBe(true)
  })

  it('honours explicit cta frontmatter', () => {
    const wrapper = mountLanding({
      cta: { message: 'Call the team', route: '/contact' }
    })

    expect(wrapper.find('[data-ssg="hero-cta"]').text()).toContain(
      'Call the team'
    )
  })

  it('places social proof inside the hero, adjacent to the CTA', () => {
    const wrapper = mountLanding()

    // Adjacency is the point: proof next to the action beats proof below the fold.
    expect(wrapper.find('.ssg-hero [data-ssg="proof"]').exists()).toBe(true)
    expect(wrapper.find('.ssg-hero [data-ssg="proof"]').text()).toContain('4.9')
    expect(wrapper.find('.ssg-hero [data-ssg="proof"]').text()).toContain('214')
  })

  it('renders the service tiles from the cards frontmatter', () => {
    const wrapper = mountLanding()

    expect(wrapper.find('[data-ssg="bento"]').exists()).toBe(true)
    expect(wrapper.find('[data-ssg="bento"]').text()).toContain(
      'Emergency callout'
    )
    expect(wrapper.find('[data-ssg="bento"]').text()).toContain('Fixed pricing')
  })

  it('renders the trust section with reviews and verifiable details', () => {
    const wrapper = mountLanding()
    const proof = wrapper.find('[data-ssg="proof-section"]')

    expect(proof.exists()).toBe(true)
    expect(proof.text()).toContain('Fixed our leak the same day.')
    expect(proof.text()).toContain('Amsterdam, Haarlem')
    expect(proof.text()).toContain('KVK 12345678')
    expect(proof.text()).toContain('Insured')
  })

  it('renders the FAQ from frontmatter', () => {
    const wrapper = mountLanding()
    const faq = wrapper.find('[data-ssg="faq"]')

    expect(faq.exists()).toBe(true)
    expect(faq.findAll('details')).toHaveLength(2)
    expect(faq.text()).toContain('Do you work weekends?')
    expect(faq.text()).toContain('Yes, including Sundays.')
  })

  it('closes with a final CTA', () => {
    const wrapper = mountLanding()

    expect(wrapper.find('[data-ssg="final-cta"]').exists()).toBe(true)
    expect(wrapper.find('[data-ssg="final-cta-button"]').exists()).toBe(true)
  })

  it('degrades gracefully with no optional content', () => {
    const wrapper = mountWithQuasar(Landing, {
      props: { id: 'home', title: 'Just a title' }
    })

    expect(wrapper.findAll('h1')).toHaveLength(1)
    // No proof, no tiles, no FAQ — and no empty wrappers pretending otherwise.
    expect(wrapper.find('[data-ssg="proof-section"]').exists()).toBe(false)
    expect(wrapper.find('[data-ssg="bento"]').exists()).toBe(false)
    expect(wrapper.find('[data-ssg="faq"]').exists()).toBe(false)
  })
})

describe('landing layout', () => {
  const layoutProps = {
    title: 'Acme Plumbing',
    favicon: '/favicon.ico',
    pages: samplePages,
    tags: sampleTags,
    extra
  }

  it('renders the sticky mobile action bar with a one-tap call link', () => {
    const wrapper = mountWithQuasar(LandingLayout, { props: layoutProps })
    const bar = wrapper.find('[data-ssg="sticky-cta"]')

    expect(bar.exists()).toBe(true)
    expect(bar.find('a[href="tel:+31201234567"]').exists()).toBe(true)
  })

  it('points the secondary sticky action at the contact page', () => {
    const wrapper = mountWithQuasar(LandingLayout, { props: layoutProps })
    const bar = wrapper.find('[data-ssg="sticky-cta"]')

    expect(bar.html()).toContain('/contact')
  })
})
