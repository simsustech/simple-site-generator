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
        <CtaButton
          v-if="cta?.message"
          class="ssg-page-header__cta"
          :label="cta.message"
          :route="cta.route"
          :href="cta.href"
          data-ssg="hero-cta"
        />
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
import CtaButton from '../shared/CtaButton.vue'
import PageContent from '../shared/PageContent.vue'
import type { PageProps } from '../shared/types.js'

const props = defineProps<PageProps>()
</script>
