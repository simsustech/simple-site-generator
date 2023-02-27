<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <div class="page-content">
        <q-toolbar style="height: 100px">
          <q-btn class="lt-sm" icon="menu" @click="drawer = !drawer" />
          <q-avatar
            square
            style="height: 50px; width: 50px"
            class="q-mt-xs q-mb-xs q-mr-lg"
          >
            <img alt="Logo" :src="favicon" />
          </q-avatar>
          <q-space horizontal />
          <q-tabs v-model="tab" class="gt-sm">
            <!-- <q-route-tab
              :name="landingPage.title"
              :label="landingPage.title"
              to="/"
            />-->
            <div v-for="page in menuPages">
              <q-btn-dropdown
                auto-close
                stretch
                flat
                split
                v-if="page.subpages"
                :label="page.label"
                :to="page.id"
              >
                <q-list>
                  <q-item
                    v-for="child in page.subpages"
                    flat
                    clickable
                    :name="child.label"
                    :to="child.id"
                  >
                    <q-item-section>{{ child.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <q-route-tab
                v-else
                :key="page.id"
                :name="page.label"
                :to="page.id"
                :label="page.label"
              />
            </div>

            <!--
            <q-route-tab
              v-for="page in menuPages"
              :key="page.id"
              :name="page.label"
              :to="page.id"
              :label="page.label"
            />
            -->
          </q-tabs>
          <q-space horizontal />
          <q-btn-dropdown
            class="gt-sm"
            auto-close
            stretch
            flat
            :label="tags.contact.label"
          >
            <q-list separator>
              <q-item
                v-for="page in contactPages"
                :key="page.id"
                :to="page.id"
                clickable
              >
                <q-item-section>{{ page.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
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
          style="height: 50px; width: 50px"
          class="q-mt-xs q-mb-xs q-mr-lg"
        >
          <img alt="Logo" :src="favicon" />
        </q-avatar>
      </div>
      <div class="q-mr-md q-ml-md row">
        <p class="text-h6" style="overflow-wrap: anywhere">{{ title }}</p>
      </div>
      <q-scroll-area class="fit">
        <q-list>
          <!-- <q-item clickable to="/" exact v-ripple>
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>{{ landingPage.title }}</q-item-section>
          </q-item>-->
          <q-item
            v-for="page in menuPages"
            clickable
            :key="page.id"
            :to="page.id"
            exact
            v-ripple
          >
            <q-item-section avatar>
              <q-icon :name="page.icon" />
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
          <!-- <q-item-label header>{{ contact.label }}</q-item-label> -->
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
        <!-- <div class="col-3" /> -->
        <div v-if="openingTimesLists" class="col-12 col-md-4">
          <router-link to="/openingtimes">Openingstijden:</router-link>
          <q-list
            v-for="list in openingTimesLists"
            :key="list.header"
            dense
            :dark="false"
          >
            <q-item-label header v-if="list.header">{{
              list.header
            }}</q-item-label>
            <q-item
              class="text-grey-8"
              v-for="item in list.items"
              :key="item.label"
            >
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
          <!-- <div v-for="qualityMark in qualityMarks" class="row">
            <q-img
              class="q-ma-md"
              :src="qualityMark.imageUrl"
              spinner-color="white"
              style="max-width: 80px"
              @click="openLink(qualityMark.url)"
              fit="contain"
          />-->
          <!-- <a href="{{ qualityMark.url }}" target="_blank">
              <q-avatar square style="height: 75px; width: 75px" class="q-mt-xs q-mb-xs q-mr-lg">
                <img src="{{ qualityMark.imageUrl }}" />
              </q-avatar>
          </a>-->
          <!-- </div> -->
        </div>
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
