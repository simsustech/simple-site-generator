import type { RouteRecordRaw } from 'vue-router'
// The slim virtual module carries ONLY the site identity the client needs.
// Importing `virtual:vitrify-config` instead inlined the entire build config
// (including the whole UnoCSS/Quasar option tree) into the browser bundle —
// 205 KB raw / 109 KB minified on the previous version of this file.
import { site } from 'virtual:ssg:site'
import { QNoSsr } from 'quasar'
import { defineAsyncComponent, h } from 'vue'
import { Layout } from 'virtual:ssg:template'

const { tags, extra } = site

/** Frontmatter a page file may declare (see CONTENT-BLUEPRINT.md). */
interface PageFrontmatter {
  id?: string
  title?: string
  label?: string
  description?: string
  /** Sort weight; the home page is always first. */
  order?: number
  /** Name of the template component to render, e.g. `Landing`. */
  page?: string
  /** Render this page client-side only. */
  noSsr?: boolean
  /** Keep the page out of the index and the sitemap. */
  noindex?: boolean
  image?: string
  breadcrumbs?: string[]
  tags?: string[]
  [key: string]: unknown
}

interface PageModule {
  attributes?: PageFrontmatter
  html?: string
  default?: unknown
}

/**
 * Markdown and Vue pages, eagerly imported so the route table is complete at
 * module-evaluation time (prerendering needs every route to exist up front).
 *
 * The pattern MUST be relative. The previous version was a bare `src/pages` path,
 * which Vite 8 rejects outright — "Invalid glob … It must start with '/' or
 * './'" — so the glob resolved to nothing and every page silently disappeared
 * from the build. The extglob alternation that also changed is NOT the cause: the
 * extglob and brace forms match identically once the leading './' is present, and
 * `test/page-glob.test.ts` pins that.
 *
 * Note for editors: never write a glob containing a `*` immediately followed by a
 * `/` inside a block comment — the `*` + `/` pair closes the comment early and
 * the rest of the comment is parsed as code.
 */
const pagesImport = import.meta.glob(
  ['../pages/**/*.{md,vue}', '!**/Error404Page.vue'],
  { eager: true }
)

const noSsrComponent = {
  name: 'NoSSRWrapper',
  render(this: { component: unknown; page: unknown }) {
    const component = defineAsyncComponent(this.component as never)
    return h(QNoSsr, null, {
      default: () => h(component, this.page as Record<string, unknown>)
    })
  },
  props: ['page', 'component']
}

function attributesOf(page: unknown): PageFrontmatter {
  return (page as PageModule | undefined)?.attributes ?? {}
}

/**
 * Home first, then pages with an explicit `order`, then the rest alphabetically.
 */
const orderedPages = [
  ...Object.entries(pagesImport)
    .filter(([, page]) => {
      const { id, order = 0 } = attributesOf(page)
      return order || id === 'home'
    })
    .sort(([, pageA], [, pageB]) => {
      const { id: idA, order: orderA = 0 } = attributesOf(pageA)
      const { id: idB, order: orderB = 0 } = attributesOf(pageB)

      if (idA === 'home') return -1
      if (idB === 'home') return 1

      return orderA - orderB
    }),
  ...Object.entries(pagesImport).filter(([, page]) => {
    const { id, order = 0 } = attributesOf(page)
    return !order && id && id !== 'home'
  })
]

const pageList = orderedPages.map(([, page]) => attributesOf(page))

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    props: {
      ...site,
      pages: pageList,
      tags,
      extra
    },
    children: [
      ...orderedPages.map(([, page]) => {
        const { id = '', page: componentName = '', noSsr } = attributesOf(page)
        const { attributes = {}, html = '' } = (page ?? {}) as PageModule

        const vuePage = async () => {
          if ((page as PageModule).default) {
            return (page as PageModule).default
          }

          return import('virtual:ssg:template').then((module) => {
            const templates = module.default
            return componentName && templates[componentName]
              ? templates[componentName]
              : module.Page
          })
        }

        const props = {
          ...attributes,
          content: html,
          pages: pageList,
          // The business details (phone, reviews, service area) live on the site
          // config, not in each page's frontmatter, but the landing page needs them
          // for its proof/CTA sections — so they are passed down here rather than
          // duplicated into every page.
          extra
        }

        return {
          // The home page lives at the parent path, so its child path is empty.
          path: id === 'home' ? '' : id,
          name: id,
          component: noSsr ? noSsrComponent : vuePage,
          props: noSsr ? { page: props, component: vuePage } : props,
          alias: id === 'home' ? ['home'] : [],
          /**
           * The single source of truth about a page, read by both the shell (for
           * `<head>` tags) and the build (for the sitemap).
           */
          meta: {
            id,
            title: attributes.title,
            description: attributes.description,
            noindex: attributes.noindex ?? false,
            image: attributes.image,
            breadcrumbs: attributes.breadcrumbs
          }
        } as RouteRecordRaw
      }),

      // The catch-all is a CHILD of the layout on purpose. As a sibling it
      // rendered outside the shell, so it had no header, no footer and — because
      // `useSeo` lives in the layout — no `<head>` tags at all. Vue Router ranks
      // a catch-all last, so it cannot shadow a real page.
      {
        path: ':catchAll(.*)*',
        name: 'not-found',
        component: () => import('../pages/Error404Page.vue'),
        meta: { id: '404', title: 'Page not found', noindex: true }
      }
    ]
  }
]

export default routes
