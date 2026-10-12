import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { QuasarResolver } from 'unplugin-vue-components/resolvers'

/**
 * Unit/component harness for this package — seam S2 (component render) and
 * seam S3 (pure builders such as `buildMeta` / `buildSitemap`).
 *
 * The plugin chain mirrors `vite.config.ts` on purpose. Without
 * `unplugin-vue-components` + `QuasarResolver`, `<q-page>` and friends are
 * unknown elements: Vue leaves them in the DOM verbatim, so `<q-header>`
 * renders as a literal `<q-header>` tag instead of a `<header>`. Assertions
 * then pass (or fail) for reasons that have nothing to do with real rendering.
 */
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [QuasarResolver()],
      dts: false
    })
  ],
  resolve: {
    alias: [
      // Vitest is not an SSR context. Without this, Quasar resolves to its
      // server build and installing the plugin throws "The SSR server build was
      // installed without an ssrContext". Only the bare `quasar` specifier is
      // rewritten, so subpath imports (`quasar/wrappers`) still resolve.
      { find: /^quasar$/, replacement: 'quasar/dist/quasar.client.js' }
    ]
  },
  test: {
    environment: 'happy-dom',
    include: ['test/**/*.test.ts'],
    reporters: 'default'
  }
})
