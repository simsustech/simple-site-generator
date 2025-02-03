<template>
  <q-page>
    <div
      class="column bg-gradient-to-br from-primary from-60% to-secondary h-100vh"
    >
      <div class="col-1"></div>
      <div class="col-4 text-center">
        <q-img class="max-w-80vw" height="100%" fit="fill" :src="logoSrc" />
      </div>
      <div class="col-1" />
      <div class="col-3">
        <div
          v-if="address || phoneNumber || email"
          class="row text-h6 justify-center"
        >
          <div class="col"></div>
          <div class="col-auto mr-3rem">
            <div v-if="phoneNumber" class="row">
              <div class="col">
                <q-icon name="i-mdi-phone" />
              </div>
            </div>
            <div class="row">
              <div class="col">
                <q-icon name="i-mdi-location" />
              </div>
            </div>
            <div class="row">
              <div class="col">&nbsp;</div>
            </div>
            <div class="row">
              <div class="col">&nbsp;</div>
            </div>
            <div v-if="email" class="row">
              <div class="col">
                <q-icon name="i-mdi-email" />
              </div>
            </div>
          </div>
          <div class="col-auto">
            <div v-if="phoneNumber" class="row">{{ phoneNumber }}</div>
            <div class="row">{{ address }}</div>
            <div class="row">{{ postalCode }}</div>
            <div class="row">{{ city }}</div>
            <div v-if="email" class="row">
              <q-no-ssr>
                <a :href="`mailto:${email}`">{{ email }}</a>
              </q-no-ssr>
            </div>
          </div>
          <div class="col"></div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar, useMeta, openURL } from 'quasar'
import { ref, watch, toRefs, computed } from 'vue'

import type { PageProps } from '../../index.js'

const $q = useQuasar()

const props = defineProps<PageProps>()

const { extra, images, meta } = toRefs(props)

if (meta.value) {
  useMeta(meta.value)
}
const logoSrc = ref(
  images?.value?.filter((image) => image.name?.toLowerCase() === 'logo')[0].src
)

const phoneNumber = extra.value.contactDetails?.phoneNumber
const address = extra.value.contactDetails?.address
const postalCode = extra.value.contactDetails?.postalCode
const city = extra.value.contactDetails?.city
const email = extra.value.contactDetails?.email
</script>
