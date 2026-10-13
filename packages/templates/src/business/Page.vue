<template>
  <q-page class="ssg-section">
    <article class="ssg-section__inner">
      <Breadcrumbs v-if="breadcrumbs?.length" :trail="breadcrumbs" />

      <header class="ssg-business__header">
        <!--
          The page owns the document's single <h1>. `PageContent` demotes markdown
          headings so the body starts at `<h2>` and the outline stays valid.
        -->
        <h1 class="ssg-business__title">{{ title }}</h1>
        <p v-if="description" class="ssg-business__lede">{{ description }}</p>
      </header>

      <PageContent
        :content="content"
        :lists="lists"
        :videos="videos"
        :images="images"
      />

      <section v-if="cards?.length" class="ssg-business__cards">
        <h2 class="ssg-business__cards-heading">Services</h2>
        <BentoGrid :tiles="tiles" />
      </section>

      <slot />
    </article>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Breadcrumbs from '../shared/Breadcrumbs.vue'
import BentoGrid from '../shared/BentoGrid.vue'
import PageContent from '../shared/PageContent.vue'
import type { PageProps } from '../shared/types.js'

/**
 * Business/multi-page template page.
 *
 * Reuses the shared prose renderer (with its lazily-loaded markdown and media
 * player) and the shared tile grid, so a service page costs no extra JavaScript
 * beyond what the landing template already ships.
 */
const props = defineProps<PageProps & { breadcrumbs?: string[] }>()

const tiles = computed(() =>
  (props.cards ?? []).map((card) => ({
    header: card.header,
    content: card.content,
    icon: card.icon,
    cta:
      card.cta?.route && card.cta.message
        ? { message: card.cta.message, route: card.cta.route }
        : undefined
  }))
)
</script>
