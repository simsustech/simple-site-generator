<template>
  <!--
    Sticky mobile action bar.

    A fixed action bar is the one element that stays on screen on a phone, so it
    carries the two actions a visitor on a phone actually takes — booking first,
    calling second. It is a pure CSS
    affordance (no JS, no scroll listeners), hidden from `lg` up where the hero
    CTA is already visible, and it respects the device safe-area inset so it does
    not sit under an iPhone home indicator.
  -->
  <div class="ssg-sticky-cta" data-ssg="sticky-cta">
    <!--
      The booking action leads. It is the one a visitor can complete without a
      person on the other end, and it used to be the second, unfilled button next
      to a filled phone button on every page — which made calling the loudest
      thing on a site whose bookings mostly arrive online. The phone stays one tap
      away, second.
    -->
    <a
      v-if="bookHref || bookRoute"
      class="ssg-sticky-cta__action ssg-sticky-cta__action--primary"
      :href="bookHref"
      :to="bookHref ? undefined : bookRoute"
      :target="bookHref ? '_blank' : undefined"
      :rel="bookHref ? 'noopener' : undefined"
    >
      <q-icon name="i-mdi-calendar-check" aria-hidden="true" />
      <span>{{ bookLabel }}</span>
    </a>
    <a
      v-if="contactRoute"
      class="ssg-sticky-cta__action"
      :href="contactRoute"
      data-ssg="sticky-contact"
    >
      <q-icon name="i-mdi-email-outline" aria-hidden="true" />
      <span>{{ contactLabel }}</span>
    </a>
    <a v-else-if="phone" class="ssg-sticky-cta__action" :href="telHref(phone)">
      <q-icon name="i-mdi-phone" aria-hidden="true" />
      <span>{{ callLabel }}</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { telHref } from './tel.js'

/**
 * The two labels are the only visible text the kit invents for this bar, so a
 * site that is not in English has to be able to set them — "Call now" in the
 * middle of a Dutch page is exactly the half-translated chrome this kit exists
 * to avoid.
 */
withDefaults(
  defineProps<{
    /** Rendered as a `tel:` link — the whole point of the bar. */
    phone?: string
    /** In-app route for the secondary action. */
    bookRoute?: string
    /** Absolute URL for the secondary action (a booking app on another host). */
    bookHref?: string
    bookLabel?: string
    callLabel?: string
    /**
     * Route of the contact page. When set, the second action becomes a link to it
     * instead of a `tel:` link. A page with an e-mail address is a channel a
     * visitor can use at any hour, and on a site that does not want the phone to
     * be the reflex it is the better second button.
     */
    contactRoute?: string
    contactLabel?: string
  }>(),
  { bookLabel: 'Book', callLabel: 'Call now', contactLabel: 'Contact' }
)
</script>
