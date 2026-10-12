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

<style scoped>
.ssg-sticky-cta {
  display: none;
}

@media (max-width: 1023px) {
  .ssg-sticky-cta {
    position: fixed;
    inset-inline: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    gap: var(--ssg-space-2);
    padding: var(--ssg-space-2);
    /* Keep clear of the home indicator. */
    padding-bottom: calc(var(--ssg-space-2) + env(safe-area-inset-bottom, 0px));
    background: var(--q-color-surface, #ffffff);
    border-top: 1px solid rgb(0 0 0 / 12%);
  }

  .ssg-sticky-cta__action {
    display: inline-flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: var(--ssg-space-1);
    min-height: 48px;
    border: 2px solid currentcolor;
    border-radius: var(--ssg-radius);
    color: inherit;
    font-weight: 600;
    text-decoration: none;
  }

  .ssg-sticky-cta__action--primary {
    background: var(--q-color-primary, #1976d2);
    border-color: var(--q-color-primary, #1976d2);
    color: var(--q-color-on-primary, #ffffff);
  }
}
</style>
