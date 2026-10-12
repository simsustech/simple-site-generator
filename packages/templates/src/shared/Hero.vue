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

<style scoped>
.ssg-hero {
  padding-block: var(--ssg-space-5);
}

.ssg-hero--tinted {
  background: var(--ssg-surface-muted);
}

.ssg-hero__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ssg-space-4);
  width: 100%;
  max-width: var(--ssg-content-width);
  margin-inline: auto;
  padding-inline: var(--ssg-space-3);
}

.ssg-hero__copy {
  flex: 1 1 22rem;
  /* `min-width: 0` lets the flex item shrink below its content width instead of
     overflowing the viewport on narrow screens. */
  min-width: 0;
}

.ssg-hero__aside {
  flex: 1 1 18rem;
  min-width: 0;
}

.ssg-hero__title {
  font-size: var(--ssg-step-4);
  line-height: 1.1;
  margin: 0;
  text-wrap: balance;
}

.ssg-hero__tagline {
  font-size: var(--ssg-step-1);
  line-height: 1.5;
  margin: var(--ssg-space-3) 0 0;
  max-width: 40ch;
}

.ssg-hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ssg-space-3);
  margin-top: var(--ssg-space-4);
}
</style>
