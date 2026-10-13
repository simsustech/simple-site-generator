<template>
  <section v-if="entries.length" class="ssg-section" data-ssg="faq">
    <div class="ssg-section__inner">
      <h2 class="ssg-faq__heading">{{ heading }}</h2>

      <!--
        Native `<details>`/`<summary>` rather than an accordion component: it is
        keyboard- and screen-reader-accessible for free, needs zero JavaScript,
        and its text is in the HTML (so it is indexable and can back FAQPage
        structured data). A JS accordion would cost bundle weight to be worse.
      -->
      <div class="ssg-faq__list">
        <details
          v-for="entry in entries"
          :key="entry.question"
          class="ssg-faq__item"
        >
          <summary class="ssg-faq__question">{{ entry.question }}</summary>
          <p class="ssg-faq__answer">{{ entry.answer }}</p>
        </details>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    heading?: string
    entries: { question: string; answer: string }[]
  }>(),
  { heading: 'Frequently asked questions' }
)
</script>
