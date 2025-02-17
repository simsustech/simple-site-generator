<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container @click="drawer = false">
      <router-view />
      <!-- <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
      >
        <q-btn fab icon="keyboard_arrow_up" />
      </q-page-scroller> -->
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, toRefs } from 'vue'
import { openURL, useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import type { LayoutProps } from '../index.js'

const props = defineProps<LayoutProps>()

const { pages, tags } = toRefs(props)
const menuPages = pages.value
  .filter((v: any) => v.tags?.includes('menu'))
  .map((page) => ({
    ...page,
    subpages: page.subpages?.map((childId) =>
      pages.value.find((p) => p.id === childId)
    )
  }))
const contactPages = pages.value.filter((v: any) => v.tags?.includes('contact'))
const footerPages = pages.value.filter((v: any) => v.tags?.includes('footer'))
const openingTimesLists = pages.value.find(
  (v: any) => v.id === 'openingtimes'
)?.lists

// const landingPage = pages.value.find((v: any) => v.id === 'home')
// const markdownPages = pages.value.filter((v: any) => v.type === 'markdown')
const tab = ref('home')

const $q = useQuasar()
const activeRoute = useRoute()
const drawer = ref(false)

function isActiveRoute(route: string) {
  return activeRoute.path === route
}
function openLink(url: string) {
  openURL(url)
}
</script>

<style lang="sass">
.q-page-container
  padding-top: 0px
</style>
