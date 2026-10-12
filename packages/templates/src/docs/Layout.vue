<template>
  <SiteShell v-bind="props">
    <slot />
  </SiteShell>
</template>

<script setup lang="ts">
import SiteShell from '../shared/SiteShell.vue'
import type { LayoutProps } from '../shared/types.js'

/**
 * Documentation layout.
 *
 * The shell already provides the header, the section drawer and the footer, so
 * this module only exists to give the docs template its own entry point for
 * later specialisation.
 */
const props = defineProps<LayoutProps>()
</script>
