<template>
  <q-header elevated class="ssg-header">
    <div class="ssg-header__inner">
      <q-toolbar class="ssg-header__toolbar">
        <!--
          Menu toggle. It only ever shows an icon, so it carries an explicit
          accessible name (aria-label) — an icon-only control with no name is one
          of the most common Lighthouse accessibility failures.
        -->
        <q-btn
          class="gt-sm-hidden ssg-header__menu-toggle"
          flat
          dense
          icon="i-mdi-menu"
          aria-label="Open navigation"
          :aria-expanded="drawer"
          aria-controls="ssg-primary-navigation"
          @click="$emit('toggle-drawer')"
        />

        <!-- Brand: name + logo together, so the navigation identifies the site. -->
        <router-link to="/" class="ssg-header__brand">
          <img
            v-if="favicon"
            class="ssg-header__logo"
            :src="favicon"
            alt=""
            width="40"
            height="40"
            aria-hidden="true"
          />
          <span class="ssg-header__brand-name">{{ title }}</span>
        </router-link>

        <q-space />

        <nav
          id="ssg-primary-navigation"
          class="ssg-header__nav"
          aria-label="Primary"
        >
          <template v-for="page in menuPages" :key="page.id">
            <!--
              A menu page with `subpages` becomes a dropdown. Quasar's
              `q-btn-dropdown` handles the menu semantics (roving focus, Esc to
              close, `aria-expanded`) so this does not have to be hand-rolled.
            -->
            <q-btn-dropdown
              v-if="subpagesOfPage(page).length"
              flat
              no-caps
              auto-close
              split
              :label="page.label"
              :to="`/${page.id}`"
            >
              <q-list>
                <q-item
                  v-for="child in subpagesOfPage(page)"
                  :key="child.id"
                  clickable
                  :to="`/${page.id}/${child.id}`"
                >
                  <q-item-section>{{ child.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>

            <q-btn
              v-else
              flat
              no-caps
              :to="`/${page.id}`"
              :label="page.label"
            />
          </template>
          <q-btn
            v-if="contactPages.length"
            flat
            no-caps
            :label="tags?.contact?.label || 'Contact'"
          >
            <q-menu auto-close>
              <q-list separator>
                <q-item
                  v-for="page in contactPages"
                  :key="page.id"
                  clickable
                  :to="`/${page.id}`"
                >
                  <q-item-section>{{ page.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </nav>

        <q-btn flat dense icon="i-mdi-more-vert" aria-label="More options">
          <q-menu auto-close>
            <q-list>
              <q-item
                clickable
                aria-label="Toggle dark mode"
                @click="$q.dark.toggle()"
              >
                <q-item-section avatar>
                  <q-icon
                    :name="
                      $q.dark.mode ? 'i-mdi-brightness-2' : 'i-mdi-brightness-5'
                    "
                    aria-hidden="true"
                  />
                </q-item-section>
                <q-item-section>
                  {{ $q.dark.mode ? 'Light mode' : 'Dark mode' }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </div>
  </q-header>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useQuasar } from 'quasar'
import { contactPagesOf, menuPagesOf, subpagesOf } from './nav.js'
import type { LayoutProps } from './types.js'

/**
 * Desktop header. On small screens the drawer carries the navigation, so the
 * header keeps only the brand, the menu toggle and the overflow menu.
 */
const props = defineProps<
  Pick<LayoutProps, 'title' | 'favicon' | 'pages' | 'tags'> & {
    drawer?: boolean
  }
>()

defineEmits<{ 'toggle-drawer': [] }>()

const { pages, tags } = toRefs(props)
const $q = useQuasar()

const menuPages = computed(() => menuPagesOf(pages.value))

const contactPages = computed(() => contactPagesOf(pages.value))

/** Resolve a menu page's `subpages` ids to pages (see `nav.ts`). */
function subpagesOfPage(page: (typeof menuPages.value)[number]) {
  return subpagesOf(page, pages.value)
}
</script>
