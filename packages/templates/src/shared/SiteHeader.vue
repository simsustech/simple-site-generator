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
              :to="pathOf(page)"
            >
              <q-list>
                <q-item
                  v-for="child in subpagesOfPage(page)"
                  :key="child.id"
                  clickable
                  :to="pathOf(child)"
                >
                  <q-item-section>{{ child.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>

            <q-btn v-else flat no-caps :to="pathOf(page)" :label="page.label" />
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
                  :to="pathOf(page)"
                >
                  <q-item-section>{{ page.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </nav>

        <!--
          Language switch. Rendered from the page's `alternates`, so it only
          appears on pages that actually have another language, and it links to
          the *counterpart* page rather than to another site's front page.
          Desktop only: on small screens the same links live in the overflow
          menu below, where there is room for them.
        -->
        <q-btn
          v-for="alternate in otherAlternates"
          :key="alternate.lang"
          class="gt-sm ssg-header__language"
          flat
          dense
          no-caps
          icon="i-mdi-translate"
          :label="alternate.label ?? alternate.lang"
          :to="alternate.path"
        />

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

              <template v-if="otherAlternates.length">
                <q-separator />

                <q-item
                  v-for="alternate in otherAlternates"
                  :key="alternate.lang"
                  clickable
                  :to="alternate.path"
                >
                  <q-item-section avatar>
                    <q-icon name="i-mdi-translate" aria-hidden="true" />
                  </q-item-section>
                  <q-item-section>
                    {{ alternate.label ?? alternate.lang }}
                  </q-item-section>
                </q-item>
              </template>
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
import { useRoute } from 'vue-router'
import { contactPagesOf, menuPagesOf, pathOf, subpagesOf } from './nav.js'
import type { LayoutProps, SeoPage } from './types.js'

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
const route = useRoute()

/**
 * The page's language alternates, minus the page being viewed.
 *
 * Hiding the current language is what keeps the switch honest: the remaining
 * entries are the pages a visitor can actually go to, and a single-language
 * site renders no switch at all.
 */
const otherAlternates = computed(() =>
  ((route.meta as SeoPage | undefined)?.alternates ?? []).filter(
    (alternate) => alternate.path !== route.path
  )
)

const menuPages = computed(() => menuPagesOf(pages.value))

const contactPages = computed(() => contactPagesOf(pages.value))

/** Resolve a menu page's `subpages` ids to pages (see `nav.ts`). */
function subpagesOfPage(page: (typeof menuPages.value)[number]) {
  return subpagesOf(page, pages.value)
}
</script>
