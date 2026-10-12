<template>
  <q-page class="ssg-section">
    <article class="ssg-section__inner">
      <header class="ssg-docs__header">
        <!--
          The page owns the document's single <h1>; the markdown body below is
          demoted to start at <h2> by `PageContent`, which keeps the heading
          order valid.
        -->
        <h1 class="ssg-docs__title">{{ title }}</h1>
        <p v-if="description" class="ssg-docs__lede">{{ description }}</p>
      </header>

      <PageContent
        :content="content"
        :lists="lists"
        :videos="videos"
        :images="images"
      />

      <slot />
    </article>
  </q-page>
</template>

<script setup lang="ts">
import PageContent from '../shared/PageContent.vue'
import type { PageProps } from '../shared/types.js'

const props = defineProps<PageProps>()
</script>

<style scoped>
.ssg-docs__header {
  margin-bottom: var(--ssg-space-4);
}

.ssg-docs__title {
  font-size: var(--ssg-step-3);
  line-height: 1.15;
  margin: 0;
}

.ssg-docs__lede {
  font-size: var(--ssg-step-1);
  margin: var(--ssg-space-2) 0 0;
  max-width: var(--ssg-measure);
}
</style>
