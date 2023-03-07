import { groupCollapsed } from 'console'
import { RouteRecordRaw } from 'vue-router'
import config from 'virtual:vitrify-config'
import { QNoSsr } from 'quasar'
import { h, defineAsyncComponent } from 'vue'
import { Layout } from 'virtual:ssg:template'
const { title, tags, favicon, extra } = config.ssg

const pagesImport = import.meta.glob('src/pages/**/*.md', {
  eager: true
})

const noSsrComponent = {
  name: 'NoSSRWrapper',
  render() {
    const component = defineAsyncComponent(this.component)
    return h(QNoSsr, null, {
      default: (props) => h(component, this.page)
    })
  },
  props: ['page', 'component']
}

const pages = Object.entries(pagesImport).sort(
  ([key1, page1], [key2, page2]) => {
    const {
      attributes: { id: id1, order: order1 = 0 }
    } = page1
    const {
      attributes: { id: id2, order: order2 = 0 }
    } = page2
    if (id1 === 'home') return -1
    if (id2 === 'home') return 1

    return order2 ? (order1 ? order1 - order2 : 1) : -1
  }
)

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    props: {
      title,
      favicon,
      pages: pages.map(([key, page]) => page.attributes),
      tags,
      extra
    },
    children: pages.map(([key, page]) => {
      const { attributes, markdown } = page

      const vuePage = () =>
        import('virtual:ssg:template').then((module) => {
          return attributes.page && module[attributes.page]
            ? module[attributes.page]
            : module.Page
        })

      const props = {
        ...attributes,
        content: markdown,
        pages: pages.map(([key, page]) => page.attributes)
      }

      return {
        path: attributes.id === 'home' ? '' : attributes.id,
        component: attributes.noSsr ? noSsrComponent : vuePage,
        props: attributes.noSsr
          ? {
              page: props,
              component: vuePage
            }
          : props,
        alias: attributes.id === 'home' ? ['home'] : []
      }
    })
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/Error404Page.vue')
  }
]

export default routes
