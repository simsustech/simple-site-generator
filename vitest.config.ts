import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { QuasarResolver } from 'unplugin-vue-components/resolvers'

const templatesSrc = fileURLToPath(
  new URL('./packages/templates/src', import.meta.url)
)

/**
 * Repo-root Vitest configuration.
 *
 * The plugin chain mirrors the packages' real build config. In particular
 * `unplugin-vue-components` + `QuasarResolver` is required: without it
 * `<q-page>` and friends are unknown elements, Vue leaves them in the DOM
 * verbatim, and component tests assert against markup the browser never sees.
 *
 * Test roots:
 *   - `packages/templates/test/**`  — seam S2 (component render) and S3 (pure builders)
 *   - `tests/lighthouse/**`         — seam S5 (measured budgets)
 *
 * The CLI specs (seam S1, `tests/cli/**`) are deliberately **not** in this list.
 * They spawn the `ssg` binary as a subprocess ~20 times; run in parallel with the
 * component suites they contend for CPU and time out (measured: 59s and 10
 * spurious failures vs 10s and 19 passes in isolation). They have their own
 * script — `pnpm run test:cli` — and CI runs both.
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
      // Vitest is not an SSR context, so the bare `quasar` specifier must
      // resolve to Quasar's client build.
      { find: /^quasar$/, replacement: 'quasar/dist/quasar.client.js' },
      { find: '@simple-site-generator/templates', replacement: templatesSrc }
    ]
  },
  test: {
    environment: 'happy-dom',
    include: [
      'packages/templates/test/**/*.test.ts',
      'tests/lighthouse/**/*.test.ts'
    ],
    reporters: 'default'
  }
})
