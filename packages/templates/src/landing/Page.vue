<template>
  <q-page class="ssg-section">
    <article class="ssg-section__inner">
      <header class="ssg-landing__header">
        <!--
          The page owns the document's single <h1>; `PageContent` demotes markdown
          headings so the body starts at <h2> and the heading order stays valid.
        -->
        <h1 class="ssg-landing__title">{{ title }}</h1>
        <p v-if="description" class="ssg-landing__lede">{{ description }}</p>
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

/**
 * Default page for the landing template: prose with the same heading contract as
 * the docs template. Pages that need the full conversion layout opt in with
 * `page: Landing` in frontmatter, which the router resolves to `Landing.vue`.
 */
const props = defineProps<PageProps>()
</script>
