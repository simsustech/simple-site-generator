<template>
  <div class="ssg-landing">
    <!--
      One primary CTA, above the fold, in the hero. Competing calls to action
      split attention and multi-goal pages convert worse than single-goal ones, so
      every other section either supports this one or defers to it.
    -->
    <Hero
      :heading="title"
      :tagline="description"
      :cta-label="primaryCta.message"
      :cta-route="primaryCta.route"
      :secondary-label="phoneLabel"
      :secondary-href="phoneHref"
      :rating="extra?.rating"
      :review-count="extra?.reviewCount"
      :review-source="extra?.reviewSource"
    >
      <!--
        The hero's visual, in order of preference: a real screenshot, then the
        animated process graphic. A screenshot always wins — it is the product,
        and the research is unambiguous that showing the real product in the
        first scroll beats any drawn graphic. The demo is the honest fallback for
        a service that has no screenshot to show.

        The whole slot is conditional so `Hero` does not render an empty aside
        column when a page declares neither.
      -->
      <template v-if="heroImage || demoSteps.length" #aside>
        <HeroImage v-if="heroImage" :image="heroImage" />
        <HeroDemo v-else :steps="demoSteps" :label="demo?.label ?? title" />
      </template>
    </Hero>

    <BentoGrid v-if="tiles.length" :heading="cardsHeading" :tiles="tiles" />

    <ProofSection
      v-if="hasProof"
      :reviews="extra?.reviews"
      :service-area="extra?.serviceArea"
      :address="extra?.address"
      :phone="extra?.phone"
      :registration="extra?.registration"
      :insured="extra?.insured"
    />

    <section v-if="content" class="ssg-section">
      <div class="ssg-section__inner">
        <PageContent :content="content" :lists="lists" />
      </div>
    </section>

    <FaqList v-if="faq?.length" :entries="faq" />

    <section
      v-if="secondaryCta"
      class="ssg-section ssg-muted-surface"
      data-ssg="final-cta"
    >
      <div class="ssg-section__inner">
        <h2 class="ssg-landing__final-heading">{{ secondaryCta.heading }}</h2>
        <CtaButton
          :label="secondaryCta.message"
          :route="secondaryCta.route"
          :href="secondaryCta.href"
          data-ssg="final-cta-button"
        />
        <ProofStrip
          class="ssg-landing__final-proof"
          :rating="extra?.rating"
          :review-count="extra?.reviewCount"
          :source="extra?.reviewSource"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Hero from '../shared/Hero.vue'
import HeroImage from './HeroImage.vue'
import BentoGrid from '../shared/BentoGrid.vue'
import HeroDemo from '../shared/HeroDemo.vue'
import ProofSection from '../shared/ProofSection.vue'
import ProofStrip from '../shared/ProofStrip.vue'
import FaqList from '../shared/FaqList.vue'
import CtaButton from '../shared/CtaButton.vue'
import PageContent from '../shared/PageContent.vue'
import type { PageProps, SiteExtra } from '../shared/types.js'

const props = defineProps<PageProps & { extra?: SiteExtra }>()

/** The single primary action: explicit `cta:` frontmatter, else the contact page. */
const primaryCta = computed(() => ({
  message: props.cta?.message ?? 'Get a free quote',
  route: props.cta?.route ?? '/contact'
}))

const phoneHref = computed(() =>
  props.extra?.phone ? `tel:${props.extra.phone}` : undefined
)

const phoneLabel = computed(() => props.extra?.phone ?? undefined)

/**
 * LCP image. Explicit dimensions are required (`HeroImage` defaults them) so the
 * space is reserved before the bytes arrive — an unsized hero image is one of the
 * most common causes of a poor CLS score.
 */
const heroImage = computed(() => {
  const first = props.images?.[0]

  return first ? { src: first.src, alt: first.caption } : undefined
})

/**
 * The animated hero graphic's stops, from `demo:` frontmatter.
 *
 * Empty on a page that declares none, which is what makes the aside fall back to
 * nothing rather than to an empty graphic.
 */
const demoSteps = computed(() => props.demo?.steps ?? [])

const cardsHeading = computed(
  () => props.extra?.cardsHeading as string | undefined
)

const tiles = computed(() =>
  (props.cards ?? []).map((card) => ({
    header: card.header,
    content: card.content,
    icon: (card as { icon?: string }).icon,
    cta:
      card.cta?.route && card.cta.message
        ? { message: card.cta.message, route: card.cta.route }
        : undefined
  }))
)

const hasProof = computed(
  () =>
    Boolean(props.extra?.reviews?.length) ||
    Boolean(props.extra?.serviceArea?.length) ||
    Boolean(props.extra?.address)
)

/** Closing CTA. Derived from the primary one when frontmatter does not override it. */
const secondaryCta = computed(() => {
  const extra = props.extra as
    | (SiteExtra & {
        closingCta?: { message?: string; route?: string; heading?: string }
      })
    | undefined

  const closing = extra?.closingCta

  return {
    heading: closing?.heading ?? 'Ready to get started?',
    message: closing?.message ?? primaryCta.value.message,
    route: closing?.route ?? primaryCta.value.route,
    href: closing?.route ? undefined : phoneHref.value
  }
})
</script>
