<template>
  <p v-if="rating" class="ssg-proof" data-ssg="proof">
    <span class="ssg-proof__stars" aria-hidden="true">{{ stars }}</span>
    <span class="ssg-proof__text">
      <strong>{{ rating.toFixed(1) }}/5</strong>
      <template v-if="reviewCount"> from {{ reviewCount }} reviews </template>
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
const props = defineProps<{
  /** Average rating out of five, e.g. `4.9`. */
  rating?: number
  reviewCount?: number
  /** Where the reviews come from, e.g. `Google`. */
  source?: string
}>()

const stars = computed(() => {
  const full = Math.round(props.rating ?? 0)
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full))
})
</script>

<style scoped>
.ssg-proof {
  display: flex;
  align-items: center;
  gap: var(--ssg-space-1);
  margin: var(--ssg-space-2) 0 0;
  font-size: var(--ssg-step--1);
}

.ssg-proof__stars {
  letter-spacing: 0.1em;
}
</style>
