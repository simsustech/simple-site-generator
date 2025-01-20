<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <div class="page-content">
        <q-toolbar style="height: 100px">
          <q-btn icon="menu" @click="drawer = !drawer" />
          <q-avatar
            square
            style="height: 50px; width: 50px"
            class="q-mt-xs q-mb-xs q-mr-lg"
          >
            <img alt="Logo" :src="favicon" />
          </q-avatar>
          <q-space horizontal />
          <q-btn borderless flat stretch icon="more_vert">
            <q-menu>
              <q-item clickable @click="$q.dark.toggle()">
                <q-item-section avatar>
                  <q-icon
                    :name="$q.dark.mode ? 'brightness_2' : 'brightness_5'"
                  />
                </q-item-section>
              </q-item>
              <q-separator />
            </q-menu>
          </q-btn>
        </q-toolbar>
      </div>
    </q-header>
    <q-drawer v-model="drawer" bordered>
      <div class="row justify-center q-ml-lg q-mr-md">
        <q-avatar
          square
          style="height: 50px; width: 50px"
          class="q-mt-xs q-mb-xs q-mr-lg"
        >
          <img alt="Logo" :src="favicon" />
        </q-avatar>
      </div>
      <q-scroll-area class="fit">
        <q-list>
          <q-item
            v-for="page in menuPages"
            clickable
            :key="page.id"
            :to="page.id"
            exact
            v-ripple
          >
            <q-item-section avatar>
              <q-icon :name="page.icon.name" />
            </q-item-section>
            <q-item-section>{{ page.label }}</q-item-section>
          </q-item>
          <q-expansion-item icon="person" :label="tags.contact.label">
            <q-item
              v-for="page in contactPages"
              :key="page.id"
              :to="page.id"
              clickable
            >
              <q-item-section>{{ page.label }}</q-item-section>
            </q-item>
          </q-expansion-item>
        </q-list>
      </q-scroll-area>
      <q-space />
      <q-list>
        <q-item>
          <q-item-section avatar> </q-item-section>
          <q-item-section>
            <q-item-label caption>
              © <a href="https://www.simsus.tech">simsustech</a>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
    <q-page-container @click="drawer = false">
      <router-view />
      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
      >
        <q-btn fab icon="keyboard_arrow_up" />
      </q-page-scroller>
    </q-page-container>
    <div class="bg-secondary">
      <div class="row justify-center q-pa-md page-content">
        <q-list class="col-12 col-md-4" dense separator padding>
          <q-item
            v-for="page in footerPages"
            :key="page.id"
            :to="page.id"
            class="text-grey-8"
            active-class="text-grey-8"
          >
            <q-item-section>{{ page.label }}</q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, toRefs } from 'vue'
import { openURL, useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
// import type { LayoutProps } from '../index.js'
// TODO: https://github.com/vuejs/core/issues/4294
export interface LayoutProps {
  title: string
  favicon?: string
  pages?: Record<string, any>
  tags?: Record<string, any>
  extra?: Record<string, any>
}
// export interface Props extends LayoutProps {}

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
const drawer = ref(true)

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
