<template>
  <SiteShell v-bind="props">
    <slot />
  </SiteShell>
</template>

<script setup lang="ts">
import SiteShell from '../shared/SiteShell.vue'
import type { LayoutProps } from '../shared/types.js'

/**
 * Business layout.
 *
 * The shell already provides the header (including subpage dropdowns driven by
 * `subpages`), the drawer, the footer and the scroll-to-top control, so this
 * module adds nothing of its own — it exists so the business template has its own
 * entry point and can diverge later without touching the other two.
 */
const props = defineProps<LayoutProps>()
</script>
