<template>
  <q-page padding class="page-content">
    <div v-if="lists">
      <q-list v-for="list in lists" :key="list.header" :dense="list.dense">
        <q-item-label header v-if="list.header">{{ list.header }}</q-item-label>
        <q-item v-for="item in list.items" :key="item.label">
          <q-item-section avatar v-if="item.icon">
            <q-icon :color="item.icon.color" :name="item.icon.name" />
          </q-item-section>
          <q-item-section>
            <q-item-label overline v-if="item.overline">{{
              item.overline
            }}</q-item-label>
            <q-item-label>{{ item.label }}</q-item-label>
            <q-item-label caption v-if="item.caption">{{
              item.caption
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- <content /> -->
    <q-markdown v-if="content" :src="content">{{ content }}</q-markdown>

    <q-media-player
      v-if="videos"
      style="max-width: 1120px"
      class="q-pa-md"
      type="video"
      :sources="videos"
    />

    <q-carousel
      v-if="images"
      animated
      v-model="slide"
      arrows
      navigation
      infinite
      style="max-width: 1120px"
      :height="`${($q.screen.width < 1120 ? $q.screen.width : 1120) / 1.6}px`"
    >
      <q-carousel-slide
        v-for="(image, key) in images"
        :key="key"
        :name="image.name"
        :img-src="image.src"
      >
        <div v-if="image.caption" class="absolute-top custom-caption">
          <div class="text-subtitle1">{{ image.caption }}</div>
        </div>
      </q-carousel-slide>
    </q-carousel>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar, useMeta } from 'quasar'
import { ref, watch, toRefs } from 'vue'
import { QMediaPlayer } from '@quasar/quasar-ui-qmediaplayer'
import { QMarkdown } from '@quasar/quasar-ui-qmarkdown'
// import type { Component } from 'vue'
// import type { PageProps } from '../index.js'
// TODO: https://github.com/vuejs/core/issues/4294
export interface PageProps {
  id: string
  pages?: PageProps[]
  title?: string
  description?: string
  icon?: {
    name: string
    color?: string
  }
  content?: string
  cards?: {
    header: string
    content: string
    CTA: {
      message: string
      route: string
    }
  }[]
  lists?: {
    header: string
    items: {
      label: string
      overline?: string
      caption?: string
      icon?: {
        name: string
        color?: string
      }
    }[]
  }[]
  meta?: Record<string, any>
  videos?: {
    src: string
    type: string
  }[]
  images?: {
    name: string
    src: string
    caption: string
  }[]
  tags: string[]
  extra?: Record<string, any>
  cta?: {
    message: string
    route?: string
  }
}

// export interface Props extends PageProps {}

const props = defineProps<PageProps>()

const $q = useQuasar()

if (props.meta) {
  useMeta(props.meta)
}
const slide = ref(props.images?.[0].name)
const { cards, lists, meta, videos, images, extra } = toRefs(props)
watch(
  () => props.images,
  (newVal, oldVal) => {
    slide.value = newVal?.[0].name
  }
)
</script>

<style lang="sass" scoped>
@import '@quasar/quasar-ui-qmarkdown/src/QMarkdown.sass'
@import '@quasar/quasar-ui-qmediaplayer/src/QMediaPlayer.sass'

.custom-caption
  text-align: center
  padding: 12px
  color: white
  background-color: rgba(0, 0, 0, .3)
</style>
