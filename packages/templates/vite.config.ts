import { join } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { QuasarResolver } from 'unplugin-vue-components/resolvers'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))

/**
 * Build entries, stated rather than discovered.
 *
 * The previous version walked `src/` and accepted a directory as an entry when it
 * contained `<name>/<name>.ts`. It was described as "one entry per template
 * module" and that was wrong twice:
 *
 *   - half the entries are not templates. `index` is the package root, `design`
 *     is the UnoCSS design system, and `seo` is the build-time SEO surface;
 *   - the `shared/` directory the rule claimed to exclude was excluded only
 *     because nobody had created `src/shared/shared.ts`. That is a plausible
 *     barrel to add in a directory of twenty files, and it would silently have
 *     become a seventh entry with nothing in `exports` pointing at it.
 *
 * `design` is no longer a folder: it was reshaped from `src/design.ts` into
 * `src/design/design.ts` purely to satisfy that walk, which is a source tree bent
 * to fit a glob.
 *
 * Why `design` and `seo` are entries at all, rather than being exported from the
 * package root: both are loaded by build tooling, not app code. The root
 * deliberately does not re-export the design system, so an app's runtime import
 * cannot pull the UnoCSS/Quasar option tree into the client bundle; and `seo`
 * must stay free of `.vue` and Quasar imports because a Node process loads it.
 *
 * The entry *keys* are the published subpaths, so they do not have to match the
 * file names — `seo` is built from `seo/build.ts`, which is named for what it is
 * rather than for the folder it sits in. `seo/index.ts` is the app-code barrel
 * beside it and pulls in `useSeo`, which imports Vue.
 */
const templateEntries = {
  docs: join(srcDir, 'docs/docs.ts'),
  landing: join(srcDir, 'landing/landing.ts'),
  business: join(srcDir, 'business/business.ts')
}

const input = {
  index: join(srcDir, 'index.ts'),
  design: join(srcDir, 'design.ts'),
  seo: join(srcDir, 'seo/build.ts'),
  ...templateEntries
}

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
