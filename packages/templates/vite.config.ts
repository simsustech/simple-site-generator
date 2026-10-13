import { existsSync, promises } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { QuasarResolver } from 'unplugin-vue-components/resolvers'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))

/**
 * One entry per template module, plus the package's own root.
 *
 * A directory counts as a template module only when it contains
 * `<name>/<name>.ts` — that keeps `shared/` and `seo/`, which are libraries
 * imported by the modules, out of the entry list instead of failing the build
 * by looking for `shared/shared.ts`.
 *
 * `index.ts` is a *file*, so the directory walk never found it. The package
 * advertises `"."` in its `exports` map and ships `index.d.ts`, so
 * `import { CtaButton } from '@simple-site-generator/templates'` type-checked
 * everywhere and failed to resolve everywhere: `dist/index.js` was never built.
 */
const moduleEntries = (await promises.readdir(srcDir, { withFileTypes: true }))
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

const input = { index: join(srcDir, 'index.ts'), ...moduleEntries }

export default defineConfig({
  plugins: [
    vue(),
    /*
      No UnoCSS plugin here on purpose.

      This package ships components and a design-system configuration; the
      consuming app runs UnoCSS with the design system and owns the CSS. The
      plugin used to run here with a bare `presetUno()`, which meant it extracted
      utility candidates from this package's own source — prose comments, the
      preflight CSS, and the shortcut definitions themselves — and emitted them
      as per-module CSS files (`dist/business.css`, ...). The app imported those
      files through `globalCss`, so every generated site shipped them: roughly
      7 KB of duplicated, meaningless utilities, plus `.h1`/`.h2`/`.h3` height
      rules picked up from `<h1>` tag names in Vue templates.

      Removing it also removes the reason the package had a CSS export.

      (Note for editors: `star-slash-css` cannot be written literally in this
      comment. The slash-star-slash closes it, the same trap `routes.ts`
      documents for globs.)
    */
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
