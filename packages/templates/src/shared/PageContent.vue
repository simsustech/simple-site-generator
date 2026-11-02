<template>
  <div class="ssg-content">
    <template v-if="lists">
      <template v-for="list in lists" :key="list.header">
        <!--
          A list flagged `clientOnly` is rendered in the browser only. Quasar's
          `q-no-ssr` drops it from the prerendered page, which is what keeps a
          scrapeable link out of the source while a visitor still gets it.
        -->
        <q-no-ssr v-if="list.clientOnly">
          <ContentList :list="list" />
        </q-no-ssr>
        <ContentList v-else :list="list" />
      </template>
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

    <!--
      The gallery.

      Three things here are deliberate. The height comes from a CSS
      `aspect-ratio`, not from a measured pixel value: the old version read the
      viewport in JavaScript and set an inline height after hydration, which
      moved everything below it by 700px on /pension. The arrows are real
      buttons with names, because Quasar's default arrows are unnamed `div`s and
      a keyboard or screen-reader visitor could not change the photo. And every
      slide carries its caption as accessible text, since the image itself is a
      CSS background and would otherwise be silent.
    -->
    <div v-if="images?.length" class="ssg-content__gallery">
      <q-carousel
        ref="carousel"
        v-model="slide"
        animated
        arrows
        infinite
        :navigation="false"
        height="auto"
        class="ssg-content__carousel ssg-content__media"
      >
        <q-carousel-slide
          v-for="image in images"
          :key="image.name"
          :name="image.name"
          :img-src="image.src"
          :aria-label="labelOf(image)"
        >
          <div v-if="image.caption" class="ssg-content__caption">
            {{ image.caption }}
          </div>
        </q-carousel-slide>

        <template #control-prev>
          <q-btn
            class="ssg-content__carousel-control"
            flat
            round
            dense
            :aria-label="labels?.previousImage ?? 'Previous image'"
            icon="i-mdi-chevron-left"
            @click="carousel?.previous()"
          />
        </template>

        <template #control-next>
          <q-btn
            class="ssg-content__carousel-control"
            flat
            round
            dense
            :aria-label="labels?.nextImage ?? 'Next image'"
            icon="i-mdi-chevron-right"
            @click="carousel?.next()"
          />
        </template>
      </q-carousel>

      <p class="ssg-content__counter" aria-hidden="true">
        {{ currentIndex + 1 }} / {{ images.length }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import ContentList from './ContentList.vue'
import { demoteHeadings, demoteH1 } from './headings.js'
import type { PageContentProps, SiteExtra } from './types.js'

const QMediaPlayer = defineAsyncComponent(() =>
  import('@quasar/quasar-ui-qmediaplayer').then((module) => module.QMediaPlayer)
)

const props = withDefaults(
  defineProps<PageContentProps & { labels?: SiteExtra['labels'] }>(),
  {
    demoteMarkdownHeadings: true
  }
)

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

/** Quasar's carousel API: `previous()` and `next()` wrap at the ends. */
const carousel = ref<{ previous: () => void; next: () => void } | null>(null)

/** Which slide is showing, for the counter and the control labels. */
const currentIndex = computed(() =>
  Math.max(
    0,
    (props.images ?? []).findIndex((image) => image.name === slide.value)
  )
)

/**
 * What a slide is called.
 *
 * The image is a CSS `background-image` on the slide, so it has no accessible
 * name of its own. The caption is the honest name; a photo without one still
 * gets its author-given `name` rather than nothing.
 */
function labelOf(image: { name: string; caption?: string }): string {
  return image.caption ?? image.name
}
</script>
