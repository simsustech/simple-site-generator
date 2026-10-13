<template>
  <section
    class="ssg-section"
    :class="{ 'ssg-muted-surface': muted }"
    data-ssg="proof-section"
  >
    <div class="ssg-section__inner">
      <h2 class="ssg-proof-section__heading">{{ heading }}</h2>

      <div class="ssg-proof-section__grid">
        <div class="ssg-proof-section__reviews">
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
                  {{ review.rating }} out of 5
                </span>
              </span>
            </footer>
          </blockquote>
        </div>

        <aside class="ssg-proof-section__facts">
          <h3 class="ssg-proof-section__facts-heading">Verified details</h3>
          <dl class="ssg-proof-section__list">
            <template v-if="serviceArea?.length">
              <dt>Service area</dt>
              <dd>{{ serviceArea.join(', ') }}</dd>
            </template>
            <template v-if="address">
              <dt>Address</dt>
              <dd>{{ address }}</dd>
            </template>
            <template v-if="phone">
              <dt>Phone</dt>
              <dd>
                <a class="ssg-proof-section__link" :href="`tel:${phone}`">{{
                  phone
                }}</a>
              </dd>
            </template>
            <template v-if="registration">
              <dt>Registration</dt>
              <dd>{{ registration }}</dd>
            </template>
            <template v-if="insured !== undefined">
              <dt>Insurance</dt>
              <dd>{{ insured ? 'Insured' : 'Not insured' }}</dd>
            </template>
          </dl>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * Trust section: real reviews plus the verifiable business facts a visitor
 * checks before trusting a local service (service area, address, registration,
 * insurance).
 *
 * These are also the fields that feed `LocalBusiness` structured data, so what
 * the visitor reads and what a crawler reads come from the same source.
 */
withDefaults(
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
  }>(),
  {
    heading: 'What customers say',
    muted: true,
    reviews: () => []
  }
)
</script>
