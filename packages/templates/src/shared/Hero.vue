<template>
  <section class="ssg-hero" :class="{ 'ssg-hero--tinted': tinted }">
    <div class="ssg-hero__inner">
      <div class="ssg-hero__copy">
        <!--
          The hero owns the document's single <h1>. Content below it starts at
          <h2> (see `demoteHeadings`), which keeps the heading order valid.
        -->
        <h1 class="ssg-hero__title">{{ heading }}</h1>

        <p v-if="tagline" class="ssg-hero__tagline">{{ tagline }}</p>

        <div class="ssg-hero__actions">
          <CtaButton
            v-if="ctaLabel"
            :label="ctaLabel"
            :route="ctaRoute"
            :href="ctaHref"
            data-ssg="hero-cta"
          />
          <CtaButton
            v-if="secondaryLabel"
            variant="secondary"
            size="md"
            :label="secondaryLabel"
            :href="secondaryHref"
            :route="secondaryRoute"
            icon="i-mdi-phone"
            data-ssg="hero-secondary"
          />
        </div>

        <!--
          Proof sits directly under the action, not below the fold: proof next to
          the CTA converts better than proof on a separate page.
        -->
        <ProofStrip
          :rating="rating"
          :review-count="reviewCount"
          :source="reviewSource"
        />

        <slot name="proof" />
      </div>

      <div v-if="$slots.aside" class="ssg-hero__aside">
        <slot name="aside" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import CtaButton from './CtaButton.vue'
import ProofStrip from './ProofStrip.vue'

withDefaults(
  defineProps<{
    heading: string
    tagline?: string
    ctaLabel?: string
    ctaRoute?: string
    ctaHref?: string
    secondaryLabel?: string
    secondaryHref?: string
    secondaryRoute?: string
    rating?: number
    reviewCount?: number
    reviewSource?: string
    tinted?: boolean
  }>(),
  { tinted: true }
)
</script>
