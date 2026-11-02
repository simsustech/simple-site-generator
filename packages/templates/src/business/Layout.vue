<template>
  <SiteShell v-bind="props">
    <!--
      The sticky action bar belongs to the multi-page business site: a visitor who
      is ready to call should never have to scroll back up or open the drawer.
      It renders only when the site declares a phone number or a booking
      address, so a business site without either shows nothing rather than a bar
      with a dead button.
    -->
    <StickyCta
      :phone="extra?.phone"
      :book-href="extra?.clientLoginUrl"
      :book-label="extra?.labels?.book ?? extra?.labels?.clientLogin"
      :call-label="extra?.labels?.call"
      :contact-route="contactRoute"
      :contact-label="extra?.labels?.contact"
    />
    <slot />
  </SiteShell>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useRoute } from 'vue-router'
import SiteShell from '../shared/SiteShell.vue'
import StickyCta from '../shared/StickyCta.vue'
import { pathOf } from '../shared/nav.js'
import type { LayoutProps } from '../shared/types.js'

/**
 * Business layout.
 *
 * The shell provides the header (including subpage dropdowns driven by
 * `subpages`), the drawer, the footer and the scroll-to-top control; this module
 * adds the mobile action bar that a local business needs and a documentation or
 * plain-service site does not.
 */
const props = defineProps<LayoutProps>()

/**
 * The contact page, when the site has one: the bar offers it beside the booking
 * action instead of the phone number.
 *
 * Read from the pages rather than hard-coded, because `contact` is a tag the site
 * puts on a page — `/contact` is this site's choice, not the kit's.
 */
const route = useRoute()

const contactRoute = computed(() => {
  const tagged = (props.pages ?? []).filter((candidate) =>
    candidate.tags?.includes('contact')
  )

  // The tag marks the contact *group*, and a site may tag several pages with it
  // — the header shows them as a menu. A bar button labelled "Contact" has to
  // land on the page that is actually called that, so `id` decides, and a group
  // with no such page falls back to the phone number rather than guessing.
  const page =
    tagged.find((candidate) => candidate.id === 'contact') ??
    (tagged.length === 1 ? tagged[0] : undefined)

  // Not while the visitor is already on it: a button that reloads the page you
  // are reading is worse than the phone number it replaced.
  if (!page || pathOf(page) === route.path) return undefined

  return pathOf(page)
})

const { extra } = toRefs(props)
</script>
