<template>
  <SiteShell v-bind="props">
    <slot />
  </SiteShell>
</template>

<script setup lang="ts">
import SiteShell from '../shared/SiteShell.vue'
import type { LayoutProps } from '../shared/types.js'

/**
 * Plain layout.
 *
 * The shell already provides the header, the drawer, the footer, the skip link
 * and the scroll-to-top control, so this adds nothing of its own — it exists so
 * the plain template has its own entry point and can diverge later without
 * touching the other three.
 *
 * The two things this template asks of the chrome — the phone number in the
 * header and the client-login button — are read from `extra` by the shared
 * header, because a layout cannot put anything into a `q-header` that the shell
 * renders. Both are guarded: a site that sets neither renders neither.
 */
const props = defineProps<LayoutProps>()
</script>
