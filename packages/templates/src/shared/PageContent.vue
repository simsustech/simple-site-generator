<template>
  <div class="ssg-content">
    <template v-if="lists">
      <q-list v-for="list in lists" :key="list.header" :dense="list.dense">
        <q-item-label v-if="list.header" header>{{ list.header }}</q-item-label>
        <q-item
          v-for="item in list.items"
          :key="item.label"
          :clickable="item.href !== undefined"
          :href="item.href"
        >
          <q-item-section v-if="item.icon" avatar>
            <q-icon :name="item.icon.name" :color="item.icon.color" />
          </q-item-section>
          <q-item-section>
            <q-item-label v-if="item.overline" overline>
              {{ item.overline }}
            </q-item-label>
            <q-item-label>{{ item.label }}</q-item-label>
            <q-item-label v-if="item.caption" caption>
              {{ item.caption }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </template>

    <!--
      `QMarkdown` and `QMediaPlayer` are loaded lazily and only when the page
      actually needs them. Importing them statically pulled markdown-it plus the
      media player (~340 KB) into the entry chunk of every page, including pages
      that render no markdown at all.
    -->
    <Suspense v-if="markdown">
      <component :is="QMarkdown" class="ssg-prose" :src="markdown">
        {{ markdown }}
      </component>
    </Suspense>

    <Suspense v-if="videos">
      <component
        :is="QMediaPlayer"
        class="ssg-content__media"
        type="video"
        :sources="videos"
      />
    </Suspense>

    <q-carousel
      v-if="images"
      v-model="slide"
      animated
      arrows
      navigation
      infinite
      class="ssg-content__carousel ssg-content__media"
      :height="`${carouselHeight}px`"
    >
      <q-carousel-slide
        v-for="image in images"
        :key="image.name"
        :name="image.name"
        :img-src="image.src"
      >
        <div v-if="image.caption" class="ssg-content__caption">
          {{ image.caption }}
        </div>
      </q-carousel-slide>
    </q-carousel>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { demoteHeadings } from './headings.js'
import type { PageContentProps } from './types.js'

const QMarkdown = defineAsyncComponent(() =>
  import('@quasar/quasar-ui-qmarkdown').then((module) => module.QMarkdown)
)

const QMediaPlayer = defineAsyncComponent(() =>
  import('@quasar/quasar-ui-qmediaplayer').then((module) => module.QMediaPlayer)
)

const props = withDefaults(defineProps<PageContentProps>(), {
  demoteMarkdownHeadings: true
})

const $q = useQuasar()

/**
 * The hero or page header already renders the page's single `<h1>`, so markdown
 * headings are shifted down one level. Without this a markdown `#` produces a
 * second `<h1>` and Lighthouse's `heading-order` audit fails.
 */
const markdown = computed(() => {
  if (!props.content) return ''
  return props.demoteMarkdownHeadings
    ? demoteHeadings(props.content)
    : props.content
})

const slide = ref(props.images?.[0]?.name ?? '')

watch(
  () => props.images,
  (images) => {
    slide.value = images?.[0]?.name ?? ''
  }
)

const carouselHeight = computed(() => {
  const width = Math.min($q.screen.width, 1120)
  return Math.round(width / 1.6)
})
</script>
