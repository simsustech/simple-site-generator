<template>
  <q-layout view="hHh lpR fFf" class="ssg-shell">
    <SkipLink />

    <SiteHeader
      :title="title"
      :favicon="favicon"
      :pages="pages"
      :tags="tags"
      :drawer="drawer"
      @toggle-drawer="drawer = !drawer"
    />

    <q-drawer
      v-model="drawer"
      bordered
      :aria-label="'Navigation'"
      :breakpoint="1023"
    >
      <nav aria-label="Sections">
        <q-list>
          <q-item
            v-for="page in menuPages"
            :key="page.id"
            v-ripple
            clickable
            exact
            :to="`/${page.id}`"
            @click="drawer = false"
          >
            <q-item-section v-if="page.icon" avatar>
              <q-icon :name="page.icon.name" :color="page.icon.color" />
            </q-item-section>
            <q-item-section>{{ page.label }}</q-item-section>
          </q-item>
        </q-list>
      </nav>
    </q-drawer>

    <q-page-container>
      <!--
        The single `<main>` landmark that the skip link targets. Every template
        renders its page content here, so `#main` is guaranteed to exist.
      -->
      <main id="main" tabindex="-1">
        <router-view />

        <slot />
      </main>

      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
      >
        <q-btn
          fab
          icon="i-mdi-keyboard-arrow-up"
          aria-label="Back to top"
          data-ssg="back-to-top"
        />
      </q-page-scroller>
    </q-page-container>

    <SiteFooter :title="title" :pages="pages" :extra="extra" />
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import { useRoute } from 'vue-router'
import SkipLink from './SkipLink.vue'
import SiteHeader from './SiteHeader.vue'
import SiteFooter from './SiteFooter.vue'
import { menuPagesOf } from './nav.js'
import { useSeo } from '../seo/useSeo.js'
import type { LayoutProps, SeoContext, SeoPage } from './types.js'

/**
 * The one layout shared by every template module.
 *
 * Header/footer/skip-link/mobile-drawer live here, so a fix lands once instead
 * of being repeated (and drifting) across five near-identical layouts.
 *
 * It is also where the page's `<head>` tags are produced. Quasar's Meta plugin
 * collects metadata from the component chain while the route renders, and the
 * layout is the only component guaranteed to be in that chain on every route —
 * unlike a page component, which may be wrapped in `QNoSsr` or resolved lazily
 * and so never contribute. See ADR-0001.
 */
const props = defineProps<LayoutProps>()

const { pages } = toRefs(props)

const drawer = ref(false)

const menuPages = computed(() => menuPagesOf(pages.value))

const route = useRoute()

const currentPage = computed<SeoPage | undefined>(() =>
  (pages.value ?? []).find((page) =>
    page.id === 'home' ? route.path === '/' : route.path === `/${page.id}`
  )
)

const seoContext = computed<SeoContext>(() => ({
  title: props.title,
  url: props.url ?? '',
  description: props.description,
  favicon: props.favicon,
  image: props.image,
  twitter: props.twitter,
  lang: props.lang,
  extra: props.extra,
  jsonLd: props.jsonLd
}))

useSeo(currentPage.value, seoContext.value, route.path)
</script>

<style scoped>
.ssg-shell :deep(.q-page-container) {
  padding-top: 0;
}

#main {
  display: block;
  /* Programmatic focus target for the skip link; no visible ring on mouse
     interaction, but keep it for keyboard users. */
  outline: none;
}

#main:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: -3px;
}
</style>
