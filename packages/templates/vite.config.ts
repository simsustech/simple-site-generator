import { existsSync, promises } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { QuasarResolver } from 'unplugin-vue-components/resolvers'
import UnoCSS from 'unocss/vite'
import { presetUno } from 'unocss'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))

/**
 * One entry per template module.
 *
 * A directory counts as a template module only when it contains
 * `<name>/<name>.ts` — that keeps `shared/` and `seo/`, which are libraries
 * imported by the modules, out of the entry list instead of failing the build
 * by looking for `shared/shared.ts`.
 */
const input = (await promises.readdir(srcDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => existsSync(join(srcDir, name, `${name}.ts`)))
  .reduce(
    (acc, name) => {
      acc[name] = join(srcDir, name, `${name}.ts`)
      return acc
    },
    {} as Record<string, string>
  )

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS({
      presets: [presetUno()],
      mode: 'per-module'
    }),
    Components({
      resolvers: [QuasarResolver()],
      dts: 'components.d.ts'
    })
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      input,
      // Provided by the consuming app (and by Quasar), never bundled here.
      // `gray-matter` and the `node:` builtins stay external too: they are only
      // reachable through `./seo`, which is imported by build tooling running in
      // Node, never by the browser bundle.
      external: ['vue', 'quasar', 'vue-router', 'gray-matter', /^node:/],
      output: {
        // `[name].js` keeps the existing per-module filenames (`docs.js`, …)
        // without a callback whose parameter type would be implicit-any.
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        format: 'es'
      }
    }
  }
})
