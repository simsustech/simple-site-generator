<template>
  <section
    class="ssg-section"
    :class="{ 'ssg-muted-surface': muted }"
    data-ssg="proof-section"
  >
    <div class="ssg-section__inner">
      <h2 v-if="headingLabel" class="ssg-proof-section__heading">
        {{ headingLabel }}
      </h2>

      <div class="ssg-proof-section__grid">
        <div v-if="reviews?.length" class="ssg-proof-section__reviews">
          <blockquote
            v-for="review in reviews"
            :key="review.name"
            class="ssg-proof-section__review"
          >
            <p class="ssg-proof-section__text">“{{ review.text }}”</p>
            <footer class="ssg-proof-section__attribution">
              <cite>{{ review.name }}</cite>
              <span v-if="review.rating" class="ssg-proof-section__rating">
                <span aria-hidden="true">{{ '★'.repeat(review.rating) }}</span>
                <span class="ssg-proof-section__sr">
                  {{ review.rating }} / 5
                </span>
              </span>
            </footer>
          </blockquote>
        </div>

        <aside class="ssg-proof-section__facts">
          <h3 class="ssg-proof-section__facts-heading">{{ factsLabel }}</h3>
          <dl class="ssg-proof-section__list">
            <template v-if="serviceArea?.length">
              <dt>{{ labels?.serviceArea ?? 'Service area' }}</dt>
              <dd>{{ serviceArea.join(', ') }}</dd>
            </template>
            <template v-if="address">
              <dt>{{ labels?.address ?? 'Address' }}</dt>
              <dd>{{ address }}</dd>
            </template>
            <template v-if="phone">
              <dt>{{ labels?.phone ?? 'Phone' }}</dt>
              <dd>
                <a class="ssg-proof-section__link" :href="telHref(phone)">{{
                  phone
                }}</a>
              </dd>
            </template>
            <template v-if="registration">
              <dt>{{ labels?.registration ?? 'Registration' }}</dt>
              <dd>{{ registration }}</dd>
            </template>
            <template v-if="insured !== undefined">
              <dt>{{ labels?.insurance ?? 'Insurance' }}</dt>
              <dd>
                {{ insured ? insuredLabel : notInsuredLabel }}
              </dd>
            </template>
          </dl>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SiteExtra } from './types.js'
import { telHref } from './tel.js'

/**
 * Trust section: real reviews plus the verifiable business facts a visitor
 * checks before trusting a local service (service area, address, registration,
 * insurance).
 *
 * These are also the fields that feed `LocalBusiness` structured data, so what
 * the visitor reads and what a crawler reads come from the same source.
 *
 * Every string here is invented by this component, so every string is
 * configurable: a Dutch site that renders "What customers say" above its Dutch
 * reviews reads as a template somebody stopped translating halfway.
 */
const props = withDefaults(
  defineProps<{
    heading?: string
    muted?: boolean
    reviews?: { name: string; text: string; rating?: number }[]
    serviceArea?: string[]
    address?: string
    phone?: string
    /** Trade licence / company registration number. */
    registration?: string
    insured?: boolean
    /** The site's own words for the labels above (see `SiteExtra.labels`). */
    labels?: SiteExtra['labels']
  }>(),
  {
    muted: true,
    reviews: () => []
  }
)

const headingLabel = computed(
  () => props.heading ?? props.labels?.proofHeading ?? 'What customers say'
)
const factsLabel = computed(
  () => props.labels?.proofFacts ?? 'Verified details'
)
const insuredLabel = computed(() => props.labels?.insured ?? 'Insured')
const notInsuredLabel = computed(
  () => props.labels?.notInsured ?? 'Not insured'
)
</script>
