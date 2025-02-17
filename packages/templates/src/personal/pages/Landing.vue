<template>
  <q-page>
    <div class="column flex-nowrap min-h-100vh">
      <div class="col-1 bg-primary"></div>
      <div class="col-4 text-center bg-primary">
        <q-avatar size="50vmin">
          <img
            height="100%"
            fit="fill"
            :src="avatarSrc"
            fetchpriority="high"
            alt="avatar"
          />
        </q-avatar>
      </div>
      <div class="col-1 bg-primary">
        <h4 class="text-center">{{ extra.name }}</h4>
      </div>
      <div class="col-4 bg-primary items-center q-gutter-y-md">
        <div class="row justify-center">
          <q-btn
            color="secondary"
            outline
            rounded
            icon="i-mdi-youtube"
            label="Youtube"
          />
        </div>
        <div class="row justify-center">
          <q-btn
            color="secondary"
            outline
            rounded
            icon="i-mdi-instagram"
            label="Instagram"
          />
        </div>
      </div>
      <div class="col bg-primary"></div>
    </div>
    <div
      class="h-25vh bg-gradient-to-b from-primary from-35% to-transparent"
    ></div>
    <div class="">
      <slot name="default" />
    </div>
    <div class="w-full q-pb-xs text-center text-0.75em font-archivo">
      ©
      <a class="text-secondary" href="https://www.simsus.tech" target="_blank"
        >simsustech</a
      >
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
const avatarSrc = ref(
  images?.value?.filter((image) => image.name?.toLowerCase() === 'avatar')[0]
    .src
)

const phoneNumber = extra.value.contactDetails?.phoneNumber
const address = extra.value.contactDetails?.address
const postalCode = extra.value.contactDetails?.postalCode
const city = extra.value.contactDetails?.city
const email = extra.value.contactDetails?.email
</script>
