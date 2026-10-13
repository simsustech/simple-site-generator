<template>
  <!--
    Sticky mobile action bar.

    Sticky one-click calling is the main mobile conversion path for local
    services, so this is the one element that stays on screen. It is a pure CSS
    affordance (no JS, no scroll listeners), hidden from `lg` up where the hero
    CTA is already visible, and it respects the device safe-area inset so it does
    not sit under an iPhone home indicator.
  -->
  <div class="ssg-sticky-cta" data-ssg="sticky-cta">
    <a
      v-if="phone"
      class="ssg-sticky-cta__action ssg-sticky-cta__action--primary"
      :href="`tel:${phone}`"
    >
      <q-icon name="i-mdi-phone" aria-hidden="true" />
      <span>Call now</span>
    </a>
    <a v-if="bookRoute" class="ssg-sticky-cta__action" :href="bookRoute">
      <q-icon name="i-mdi-calendar-check" aria-hidden="true" />
      <span>{{ bookLabel }}</span>
    </a>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Rendered as a `tel:` link — the whole point of the bar. */
    phone?: string
    /** In-app route for the secondary action. */
    bookRoute?: string
    bookLabel?: string
  }>(),
  { bookLabel: 'Book' }
)
</script>
