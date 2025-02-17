<template>
  <q-page>
    <div
      class="column justify-center bg-gradient-to-b from-primary to-transparent q-pl-md q-pr-md"
      style="min-height: inherit"
    >
      <div class="col-md"></div>
      <div class="col">
        <div class="row items-center">
          <div class="col-1" />
          <div v-if="card" class="col-12 col-md-5 justify-center">
            <div class="row">
              <div class="col-12 text-h4">
                {{ card.header }}
              </div>
              <div class="col-12 text-h6">
                {{ card.content }}
              </div>
              <div class="col-12 text-center">
                <q-btn
                  class="q-mt-md q-mb-sm"
                  color="accent"
                  :to="card.cta.route"
                >
                  {{ card.cta.message }}
                </q-btn>
                <br />
                <router-link
                  v-if="card.cta.alternative"
                  class="text-caption"
                  :to="card.cta.alternative.route"
                  >{{ card.cta.alternative.message }}.</router-link
                >
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6 text-center">
            <q-avatar
              v-if="images?.[0]"
              size="75vmin"
              class="shadow-lg shadow-accent"
              square
              rounded
            >
              <q-img
                v-if="images"
                class="col"
                :src="images[0].src"
                height="100%"
                fit="cover"
                fetchpriority="high"
              />
            </q-avatar>
          </div>
        </div>
        <div class="col"></div>
      </div>
    </div>

    <div class="row justify-center">
      <div
        v-if="qualityMarks"
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
      <q-card
        v-if="cta"
        v-for="page in cta"
        class="col-6 q-ma-md"
        style="width: 300px"
      >
        <q-card-section style="height: 150px">
          <div class="row justify-center">
            <q-icon
              v-if="page.icon"
              size="xl"
              :color="page.icon.color"
              :name="page.icon.name"
            />
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
    <slot name="default" />
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar, useMeta, openURL } from 'quasar'
import { ref, watch, toRefs, computed } from 'vue'

import type { PageProps } from '../../index.js'

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

<style>
.avatar-border {
  box-shadow: 0 0 15px 6px var(--q-accent);
}

.page-background {
  background: var(--q-primary);
  background: linear-gradient(180deg, var(--q-primary), var(--q-secondary));
}
</style>
