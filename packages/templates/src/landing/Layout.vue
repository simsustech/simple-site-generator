<template>
  <SiteShell v-bind="props">
    <!--
      The sticky mobile action bar lives in the layout, not the page, so it stays
      available on every page of a local-business site — a visitor who is ready to
      call should never have to navigate back to the home page first.
    -->
    <StickyCta :phone="extra?.phone" :book-route="bookRoute" />
    <slot />
  </SiteShell>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import SiteShell from '../shared/SiteShell.vue'
import StickyCta from '../shared/StickyCta.vue'
import type { LayoutProps } from '../shared/types.js'

const props = defineProps<LayoutProps>()

const { pages, tags, extra } = toRefs(props)

/**
 * Where the "Book" action points: the first page tagged `contact`, falling back
 * to a `/contact` route. Resolved from the same frontmatter the navigation uses,
 * so the bar cannot drift from the site structure.
 */
const bookRoute = computed(() => {
  const contact = (pages.value ?? []).find((page) =>
    page.tags?.includes('contact')
  )

  if (contact) return `/${contact.id}`

  return tags.value?.contact ? '/contact' : undefined
})
</script>
