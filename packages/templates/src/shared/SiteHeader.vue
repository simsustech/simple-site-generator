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
          class="xl:hidden ssg-header__menu-toggle"
          flat
          dense
          icon="i-mdi-menu"
          :aria-label="openNavigationLabel"
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
          :aria-label="primaryLabel"
        >
          <template v-for="page in menuPages" :key="page.id">
            <!--
              A page with `subpages` opens a menu; the page itself is the first
              entry, so the parent stays reachable. Quasar's `q-menu` handles the
              positioning, Esc and outside-click; `q-item`'s own `active` prop
              marks the group while any of its pages is open.

              Leaf pages are `q-item` rather than `q-btn` because `q-item` is the
              component that owns router state: `to` plus `active-class` is
              native, and `q-btn` has no active props at all (only `to`,
              `replace`, `href`, `target`) — which is why the old nav could not
              show where the visitor was.
            -->
            <q-item
              v-if="subpagesOfPage(page).length"
              class="ssg-header__nav-item"
              clickable
              :active="isActiveTree(page)"
              :aria-current="isActiveTree(page) ? 'true' : undefined"
            >
              <q-item-section>{{ page.label }}</q-item-section>
              <q-menu auto-close>
                <q-list>
                  <q-item :to="pathOf(page)" clickable>
                    <q-item-section>{{ page.label }}</q-item-section>
                  </q-item>
                  <q-item
                    v-for="child in subpagesOfPage(page)"
                    :key="child.id"
                    :to="pathOf(child)"
                    clickable
                    :aria-current="
                      route.path === pathOf(child) ? 'page' : undefined
                    "
                  >
                    <q-item-section>{{ child.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>

            <q-item
              v-else
              class="ssg-header__nav-item"
              :to="pathOf(page)"
              exact
              :aria-current="route.path === pathOf(page) ? 'page' : undefined"
            >
              <q-item-section>{{ page.label }}</q-item-section>
            </q-item>
          </template>

          <q-item
            v-if="contactPages.length"
            class="ssg-header__nav-item"
            clickable
            :active="isContactActive"
            :aria-current="isContactActive ? 'true' : undefined"
          >
            <q-item-section>
              {{ tags?.contact?.label || 'Contact' }}
            </q-item-section>
            <q-menu auto-close>
              <q-list separator>
                <q-item
                  v-for="page in contactPages"
                  :key="page.id"
                  :to="pathOf(page)"
                  clickable
                  :aria-current="
                    route.path === pathOf(page) ? 'page' : undefined
                  "
                >
                  <q-item-section>{{ page.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-item>
        </nav>

        <!--
          How to reach the business, and the way into its own client
          environment. Both come from the site's `extra` and both are guarded:
          a site that sets neither — every site today except one — renders
          neither, and nothing here is invented to fill the space.

          The two extras — the phone number and the way into the customer's own
          environment — are what a header gives up last, not first: on a local
          business's site the number is the action most visitors want. They are
          shown from 1024px up, and what collapses instead is the *navigation*
          (see `ssg-header__nav`, which appears at 1280px). Below 1024px both
          stay reachable from the overflow menu, and the phone from the footer.
        -->
        <a v-if="phone" class="gt-sm ssg-header__phone" :href="telHref(phone)">
          {{ phone }}
        </a>
        <a
          v-if="clientLoginUrl"
          class="gt-sm ssg-header__login"
          :href="clientLoginUrl"
          target="_blank"
          rel="noopener"
          :aria-label="loginLabel"
          data-ssg="client-login"
        >
          {{ loginLabel }}
        </a>

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

        <q-btn flat dense icon="i-mdi-more-vert" :aria-label="moreOptionsLabel">
          <q-menu auto-close>
            <q-list>
              <q-item
                clickable
                :aria-label="themeLabel"
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
                  {{ themeLabel }}
                </q-item-section>
              </q-item>

              <!--
                No phone number here. It was added so the number survived between
                1024 and 1439 pixels, where the header has no room for it — but a
                menu that opens on "call us" is the same nudge the site is trying
                to lose, and below `lg` the fixed action bar already carries the
                number one tap away. The header still shows it from `gt-sm` up,
                and the footer on every page.
              -->
              <template v-if="clientLoginUrl">
                <q-separator />

                <q-item
                  clickable
                  :href="clientLoginUrl"
                  target="_blank"
                  rel="noopener"
                  :aria-label="loginLabel"
                  data-ssg="client-login"
                >
                  <q-item-section avatar>
                    <q-icon
                      name="i-mdi-account-circle-outline"
                      aria-hidden="true"
                    />
                  </q-item-section>
                  <q-item-section>{{ loginLabel }}</q-item-section>
                </q-item>
              </template>

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
import type { LayoutProps, SeoPage, SiteExtra } from './types.js'
import { telHref } from './tel.js'

/**
 * Desktop header. On small screens the drawer carries the navigation, so the
 * header keeps only the brand, the menu toggle and the overflow menu.
 */
const props = defineProps<
  Pick<LayoutProps, 'title' | 'favicon' | 'pages' | 'tags' | 'lang'> & {
    drawer?: boolean
    /**
     * The site's own facts. `phone` and `clientLoginUrl` are the two the chrome
     * renders; both are optional and neither is guessed at.
     */
    extra?: SiteExtra
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

const menuPages = computed(() => menuPagesOf(pages.value, props.lang))

/** Whether the current route is one of this page's own subpages. */
function isActiveTree(page: (typeof menuPages.value)[number]): boolean {
  const target = pathOf(page)

  if (route.path === target) return true

  return subpagesOfPage(page).some((child) => route.path === pathOf(child))
}

/** Whether the current route is one of the pages in the contact menu. */
const isContactActive = computed(() =>
  contactPages.value.some((page) => route.path === pathOf(page))
)

const contactPages = computed(() => contactPagesOf(pages.value, props.lang))

/**
 * The phone number, as the chrome shows it.
 *
 * `extra` is an open bag (`SiteExtra`), so the value is checked rather than
 * trusted: an empty string or a non-string would otherwise render `<a href="tel:">`
 * — a link that looks like a phone number and dials nothing.
 */
const phone = computed(() => {
  const value = props.extra?.phone

  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined
})

/**
 * The client environment, when the site has one.
 *
 * Absent is the normal state, not a misconfiguration: the address comes from
 * the owner and the site ships before it arrives. A button that points nowhere
 * is worse than no button, so nothing renders until the address is set.
 */
const clientLoginUrl = computed(() => {
  const value = props.extra?.clientLoginUrl

  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined
})

/**
 * The theme switch, naming the action rather than the current state.
 *
 * "Donker" while the page is light is what a visitor is looking for. Taken from
 * the site's own `labels` because the shared chrome has no business deciding
 * what language a site speaks; the English words are the fallback, not the rule.
 */
const themeLabel = computed(() =>
  $q.dark.mode
    ? (props.extra?.labels?.light ?? 'Light mode')
    : (props.extra?.labels?.dark ?? 'Dark mode')
)

/** The customer-login label, likewise from the site's configuration. */
const loginLabel = computed(
  () => props.extra?.labels?.clientLogin ?? 'Client login'
)

/**
 * The accessible names this header invents.
 *
 * None of them is visible, so a site that translates only its page copy leaves
 * every one of them in English — and these are the strings a screen-reader user
 * hears first. They come from `extra.labels` with the English fallbacks.
 */
const openNavigationLabel = computed(
  () => props.extra?.labels?.openNavigation ?? 'Open navigation'
)
const primaryLabel = computed(() => props.extra?.labels?.primary ?? 'Primary')
const moreOptionsLabel = computed(
  () => props.extra?.labels?.moreOptions ?? 'More options'
)

/** Resolve a menu page's `subpages` ids to pages (see `nav.ts`). */
function subpagesOfPage(page: (typeof menuPages.value)[number]) {
  return subpagesOf(page, pages.value)
}
</script>
