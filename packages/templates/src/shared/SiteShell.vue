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
          <q-item v-for="page in menuPages" :key="page.id" role="listitem">
            <q-item-section v-if="page.icon" avatar>
              <q-icon :name="page.icon.name" :color="page.icon.color" />
            </q-item-section>
            <q-item-section>
              <!--
                The link is a real anchor inside a list item rather than a
                clickable `q-item`. A `q-list` renders `role="list"`, and a
                clickable item renders an `<a>`, which is not a `listitem` — so
                Lighthouse's `aria-required-children` audit fails the list.
                Keeping the anchor inside a `listitem` satisfies the list and
                keeps the link role intact.
              -->
              <router-link
                class="ssg-shell__drawer-link"
                :to="pathOf(page)"
                @click="drawer = false"
              >
                {{ page.label }}
              </router-link>
            </q-item-section>
          </q-item>

          <!--
            The contact page is tagged `contact`, not `menu`, because the header
            renders it as its own button. That button lives in the desktop
            navigation, which is hidden below `lg` — so without this the drawer
            had no way to reach it, and a visitor on a phone could only arrive at
            the contact page through a CTA somewhere in the content.

            This mirrors the header's contact menu exactly: the same tagged
            pages, under the same label, and each page's own icon rather than a
            mail icon borrowed for all of them.
          -->
          <template v-if="contactPages.length">
            <q-separator spaced />
            <q-item-label header>
              {{ tags?.contact?.label || 'Contact' }}
            </q-item-label>
            <q-item v-for="page in contactPages" :key="page.id" role="listitem">
              <q-item-section v-if="page.icon" avatar>
                <q-icon :name="page.icon.name" :color="page.icon.color" />
              </q-item-section>
              <q-item-section>
                <router-link
                  class="ssg-shell__drawer-link"
                  :to="pathOf(page)"
                  @click="drawer = false"
                >
                  {{ page.label }}
                </router-link>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </nav>
    </q-drawer>

    <q-page-container>
      <!--
        The skip link target. It is a plain `div`, deliberately NOT the `main`
        landmark: the page component renders `q-page`, which Quasar renders as a
        `main` element by itself, and a document must have exactly one. Keeping a
        wrapper here means `#main` exists even on a page that renders no
        `q-page` (the 404 page, or a custom page component).
      -->
      <div id="main" tabindex="-1">
        <router-view />

        <slot />
      </div>

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
import { computed, onUnmounted, ref, toRefs, useSSRContext, watch } from 'vue'
import { useRoute } from 'vue-router'
import SkipLink from './SkipLink.vue'
import SiteHeader from './SiteHeader.vue'
import SiteFooter from './SiteFooter.vue'
import { contactPagesOf, menuPagesOf, pathOf } from './nav.js'
import { withLang } from './html-lang.js'
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

const { pages, tags } = toRefs(props)

const drawer = ref(false)

const menuPages = computed(() => menuPagesOf(pages.value))

const contactPages = computed(() => contactPagesOf(pages.value))

const route = useRoute()

const currentPage = computed<SeoPage | undefined>(() => {
  // The route's own `meta` is authoritative: it is derived in `routes.ts` from
  // the same frontmatter the page list is built from, and it also covers routes
  // that are not in `pages` at all (the 404 page). Falling back to the page list
  // keeps an older, meta-less route table working.
  const fromRoute = route.meta as SeoPage | undefined

  if (fromRoute?.id) return fromRoute

  return (pages.value ?? []).find((page) =>
    page.id === 'home' ? route.path === '/' : route.path === `/${page.id}`
  )
})

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

/**
 * Keep `<html lang>` in step with the page's language.
 *
 * See `html-lang.ts` for why this is written through the SSR context instead of
 * by swapping Quasar's language pack. On the server the tag is serialized once,
 * so a prerendered Dutch page ships `lang="nl"`; in the browser the same watch
 * fixes the attribute after a client-side navigation, and resets it to the site
 * default on the way back.
 *
 * The server is detected by the absence of `document` rather than by
 * `import.meta.env.SSR`: this package is prebuilt as a client bundle, so that
 * constant is baked to `false` here and would always take the browser path.
 */
const ssrContext =
  typeof document === 'undefined'
    ? (useSSRContext() as { _meta?: { htmlAttrs?: string } } | undefined)
    : undefined

function applyHtmlLang(lang: string | undefined): void {
  const value = lang ?? props.lang

  if (!value) return

  const meta = ssrContext?._meta

  if (meta) {
    meta.htmlAttrs = withLang(meta.htmlAttrs ?? '', value)
    return
  }

  if (typeof document !== 'undefined') document.documentElement.lang = value
}

watch(() => currentPage.value?.lang, applyHtmlLang, { immediate: true })
</script>
