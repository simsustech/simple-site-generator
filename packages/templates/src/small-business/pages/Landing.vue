<template>
  <q-page>
    <div class="row">
      <q-img
        v-if="images"
        class="col"
        :src="images[0].src"
        :style="{
          height: $q.screen.gt.sm ? '90vh' : '700px'
        }"
        fit="cover"
        position="50% 0%"
      >
        <div class="absolute-top q-mt-xl text-center transparent">
          <q-card
            class="text-center"
            :class="$q.dark.isActive ? 'text-white' : 'text-black'"
            :dark="$q.dark.isActive"
            :style="{
              'background-color': $q.dark.isActive
                ? 'rgba(0, 0, 0, 0.7)'
                : 'rgba(240, 240, 240, 0.7)'
            }"
          >
            <q-card-section>
              <h3 style="word-wrap: break-word">{{ card.header }}</h3>
              <p>{{ card.content }}</p>
              <q-card-actions v-if="card.cta">
                <div class="row justify-center full-width">
                  <q-btn class="col" :to="card.cta.route" color="accent">{{
                    card.cta.message
                  }}</q-btn>
                </div>
              </q-card-actions>
            </q-card-section>
          </q-card>
        </div>
      </q-img>
    </div>

    <div class="row justify-center">
      <div
        v-for="qualityMark in qualityMarks"
        class="col-3 text-center q-ma-md"
      >
        <q-img
          :src="qualityMark.imageUrl"
          spinner-color="white"
          style="max-width: 150px; max-height: 150px"
          @click="openURL(qualityMark.url)"
          fit="contain"
        />
      </div>
    </div>

    <div class="row justify-center">
      <q-card v-for="page in cta" class="col-6 q-ma-md" style="width: 300px">
        <q-card-section style="height: 150px">
          <div class="row justify-center">
            <q-icon size="xl" :name="page.icon.name" />
          </div>
          <div class="row justify-center">
            <div class="text-subtitle2">{{ page.title }}</div>
          </div>
          <div class="row justify-center">
            <div class="text-caption text-center">{{ page.description }}</div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions v-if="page.cta" vertical>
          <q-btn :to="'/' + page.id" flat>{{ page.cta }}</q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar, useMeta, openURL } from 'quasar'
import { ref, watch, toRefs, computed } from 'vue'
import type { Component } from 'vue'

// import type { PageProps } from '../../index.js'
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
    cta: {
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

const $q = useQuasar()

const props = defineProps<PageProps>()

const { pages, cards, extra, images, meta } = toRefs(props)

const cta = computed(() => pages?.value?.filter((page) => page.cta))
if (meta.value) {
  useMeta(meta.value)
}
const slide = ref(images?.value?.[0].name)
watch(
  () => props.images,
  (newVal, oldVal) => {
    slide.value = newVal?.[0].name
  }
)

const qualityMarks = computed(() => extra?.value?.qualityMarks)
const card = computed(() => cards?.value?.at(0))
// const card = ref()
// if (props.cards?.[0]) {
//   card.value = props.cards[0]
// }
// const pages = ref(ssg.pages);
</script>
