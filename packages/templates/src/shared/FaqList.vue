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

<style scoped>
.ssg-faq__heading {
  font-size: var(--ssg-step-3);
  margin: 0 0 var(--ssg-space-4);
}

.ssg-faq__list {
  max-width: var(--ssg-measure);
}

.ssg-faq__item {
  border-bottom: 1px solid rgb(0 0 0 / 12%);
}

.ssg-faq__question {
  padding: var(--ssg-space-3) 0;
  font-size: var(--ssg-step-1);
  font-weight: 600;
  cursor: pointer;
}

.ssg-faq__answer {
  margin: 0 0 var(--ssg-space-3);
  line-height: 1.65;
}
</style>
