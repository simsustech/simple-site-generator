<template>
  <p v-if="rating" class="ssg-proof" data-ssg="proof">
    <span class="ssg-proof__stars" aria-hidden="true">{{ stars }}</span>
    <span class="ssg-proof__text">
      <strong>{{ formatted }}/5</strong>
      <template v-if="reviewCount">
        {{ prefix }} {{ reviewCount }} {{ suffix }}
      </template>
      <template v-if="source"> · {{ source }}</template>
    </span>
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Social proof, placed directly beneath the primary CTA.
 *
 * Proof next to the action outperforms proof on a separate page or relegated to
 * a badge below the fold, so this is designed to sit inside the hero.
 */
const props = withDefaults(
  defineProps<{
    /** Average rating out of five, e.g. `4.9`. */
    rating?: number
    reviewCount?: number
    /** Where the reviews come from, e.g. `Google`. */
    source?: string
    /**
     * BCP-47 tag for the number, so `nl` renders `4,9` and `en` renders `4.9`.
     * A decimal point in a Dutch sentence is one of the small tells that a page
     * was assembled rather than written.
     */
    lang?: string
    /** The word before the count; a site in another language passes its own. */
    prefix?: string
    /** The noun after the count. */
    suffix?: string
  }>(),
  { lang: 'en', prefix: 'from', suffix: 'reviews' }
)

const formatted = computed(() =>
  new Intl.NumberFormat(props.lang, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(props.rating ?? 0)
)

const stars = computed(() => {
  const full = Math.round(props.rating ?? 0)
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full))
})
</script>
