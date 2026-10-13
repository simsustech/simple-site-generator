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
      The content arrives as HTML: `vite-plugin-markdown` renders the Markdown
      at build time, so the page module carries the rendered result. Rendering
      it with `v-html` keeps the whole markdown toolchain out of the client
      bundle, and the design system styles the output itself (`ssg-prose`) — no
      Markdown component and no ported stylesheet is involved.

      The content is authored in this repository, never by a visitor, which is
      what makes `v-html` safe here.
    -->
    <div v-if="content" class="ssg-prose ssg-content__markdown" v-html="body" />

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
import { demoteHeadings, demoteH1 } from './headings.js'
import type { PageContentProps } from './types.js'

const QMediaPlayer = defineAsyncComponent(() =>
  import('@quasar/quasar-ui-qmediaplayer').then((module) => module.QMediaPlayer)
)

const props = withDefaults(defineProps<PageContentProps>(), {
  demoteMarkdownHeadings: true
})

const $q = useQuasar()

/**
 * The hero or page header already renders the page's single `<h1>`, so content
 * headings are shifted down one level. Without this a Markdown `#` (or an
 * `<h1>`) produces a second `<h1>` and Lighthouse's `heading-order` audit
 * fails.
 *
 * Both forms are handled because both reach this component: the kit's own apps
 * pass the HTML that `vite-plugin-markdown` rendered (where only an `h1` is a
 * defect), while a hand-rolled page module may still pass Markdown (where the
 * whole outline is shifted, since a `#` is the author's usual start).
 */
const body = computed(() => {
  if (!props.content) return ''

  if (!props.demoteMarkdownHeadings) return props.content

  return props.content.trimStart().startsWith('<')
    ? demoteH1(props.content)
    : demoteHeadings(props.content)
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
