<template>
  <q-page>
    <Hero
      :heading="title"
      :tagline="description"
      :cta-label="primaryCta.message"
      :cta-route="primaryCta.route"
      :cta-href="primaryCta.href"
      :secondary-label="secondaryCta.label"
      :secondary-route="secondaryCta.route"
      :secondary-href="secondaryCta.href"
      :secondary-icon="secondaryCta.icon"
      :rating="extra?.rating"
      :review-count="extra?.reviewCount"
      :review-source="extra?.reviewSource"
    >
      <!--
        The hero's visual, from the page's own `images` — the first entry, which
        is the order the author wrote them in. `HeroImage` reserves the space
        before the bytes arrive, because this is the LCP element.
      -->
      <template v-if="heroImage" #aside>
        <HeroImage :image="heroImage" />
      </template>
    </Hero>

    <BentoGrid
      v-if="tiles.length"
      :heading="cardsHeading"
      :tiles="tiles"
      data-ssg="bento"
    />

    <ProofSection
      v-if="hasProof"
      :reviews="extra?.reviews"
      :service-area="extra?.serviceArea"
      :address="extra?.address"
      :phone="extra?.phone"
      :registration="extra?.registration"
      :insured="extra?.insured"
      :labels="extra?.labels"
    />

    <section v-if="content" class="ssg-section">
      <div class="ssg-section__inner">
        <PageContent :content="content" :lists="lists" />
      </div>
    </section>

    <FaqList v-if="faq?.length" :entries="faq" />
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Hero from '../shared/Hero.vue'
import HeroImage from '../shared/HeroImage.vue'
import BentoGrid from '../shared/BentoGrid.vue'
import ProofSection from '../shared/ProofSection.vue'
import FaqList from '../shared/FaqList.vue'
import PageContent from '../shared/PageContent.vue'
import type { PageProps, SiteExtra } from '../shared/types.js'
import { telHref } from '../shared/tel.js'

/**
 * Business landing page — a conversion home page for a local business.
 *
 * The `business` module used to export `Page` only, so its front page was the
 * service-page layout: a title band, then prose. A local business's front page
 * is not a service page — it has one action, one visual, and a card for each
 * service — and the retired `small-business-v2` module said so by exporting
 * `Landing` beside `Page`. This restores that shape as a thin composition over
 * the shared layer, so nothing here duplicates a component or a style.
 *
 * It is deliberately shorter than `landing/Landing.vue`: no closing call-to-action
 * band and no `closingCta` fallback copy, because that template's fallback
 * heading is an English sentence this module would then have to translate.
 * The hero carries the action, and the phone number sits in the header.
 */
const props = defineProps<PageProps & { extra?: SiteExtra }>()

const primaryCta = computed(() => ({
  message: props.cta?.message ?? '',
  route: props.cta?.route,
  href: props.cta?.href
}))

/**
 * The quieter action beside the primary one, in order of preference: the page's
 * own `cta.secondary`, then the phone number. A landing page whose only action
 * is a form leaves the visitor who would rather call with nowhere to go, and the
 * number is already site-wide data.
 */
const secondaryCta = computed(() => {
  const secondary = props.cta?.secondary

  if (secondary?.message) {
    return {
      label: secondary.message,
      route: secondary.route,
      href: secondary.href,
      icon: secondary.href?.startsWith('tel:')
        ? 'i-mdi-phone'
        : 'i-mdi-arrow-right'
    }
  }

  if (props.extra?.phone) {
    return {
      label: props.extra.phone,
      route: undefined,
      href: telHref(props.extra.phone),
      icon: 'i-mdi-phone'
    }
  }

  return {
    label: undefined,
    route: undefined,
    href: undefined,
    icon: undefined
  }
})

const heroImage = computed(() => {
  const first = props.images?.[0]

  return first
    ? {
        src: first.src,
        alt: first.caption,
        width: first.width,
        height: first.height
      }
    : undefined
})

const cardsHeading = computed(
  () => props.extra?.cardsHeading as string | undefined
)

const tiles = computed(() =>
  (props.cards ?? []).map((card) => ({
    header: card.header,
    content: card.content,
    icon: card.icon,
    image: card.image,
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
</script>
