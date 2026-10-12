import { mount } from '@vue/test-utils'
import { Meta, Quasar, Ripple } from 'quasar'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, h, type Component, type Plugin } from 'vue'
import SiteShell from '../../src/shared/SiteShell.vue'

/**
 * Mount a component with the same environment the real app provides: the Quasar
 * plugin (so `$q` and every `q-*` component resolve), Quasar's `ripple`
 * directive, and a router (because `q-item :to` and `router-link` need one).
 *
 * Using a real memory router rather than a `RouterLink` stub keeps the test
 * honest — a stub would let a broken `to` binding pass silently.
 */
export function mountWithQuasar(
  component: Component,
  options: {
    props?: Record<string, unknown>
    slots?: Record<string, unknown>
  } = {}
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/:catchAll(.*)*', component: { template: '<div />' } }
    ]
  })

  return mount(component, {
    props: options.props,
    slots: options.slots,
    global: {
      plugins: [
        // Quasar's plugin is runtime-valid but its `install` signature
        // (`(app, options?: QuasarPluginOptions)`) is not structurally
        // assignable to Vue's `Plugin` union, so the cast is required.
        Quasar as unknown as Plugin,
        // The Meta plugin is what collects `useMeta()` output. The real app
        // registers it via `framework.plugins: ['Dialog','Notify','Loading','Meta']`.
        Meta as unknown as Plugin,
        router
      ],
      directives: {
        // `v-ripple` is a Quasar directive, not a component: it is not picked up
        // by the component resolver and must be registered explicitly.
        ripple: Ripple as never
      }
    }
  })
}

/**
 * Mount a page the way the app actually renders it — inside the shell's
 * `q-page-container`.
 *
 * A bare `q-page` outside a page container renders nothing, so mounting a page
 * component on its own would assert against an empty DOM.
 */
export function mountPageInShell(
  page: Component,
  pageProps: Record<string, unknown>,
  shellProps: Record<string, unknown> = {}
) {
  const Harness = defineComponent({
    name: 'PageInShellHarness',
    render() {
      return h(SiteShell, shellProps, {
        default: () => h(page, pageProps)
      })
    }
  })

  return mountWithQuasar(Harness)
}

/** A representative page list, matching what the generated app passes in. */
export const samplePages = [
  {
    id: 'home',
    title: 'Home',
    label: 'Home',
    icon: { name: 'i-mdi-home' },
    tags: ['menu']
  },
  {
    id: 'guides',
    title: 'Guides',
    label: 'Guides',
    icon: { name: 'i-mdi-book-open-variant' },
    tags: ['menu']
  },
  {
    id: 'contact',
    title: 'Contact',
    label: 'Contact us',
    tags: ['contact', 'footer']
  }
]

export const sampleTags = {
  menu: { label: 'Menu' },
  footer: { label: 'Footer' },
  contact: { label: 'Contact' }
}

export const shellProps = {
  title: 'Acme Corp',
  favicon: '/favicon.ico',
  pages: samplePages,
  tags: sampleTags
}
