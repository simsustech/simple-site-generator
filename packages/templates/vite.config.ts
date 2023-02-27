import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { promises, readFileSync } from 'fs'
import Components from 'unplugin-vue-components/vite'
import { QuasarResolver } from 'unplugin-vue-components/resolvers'

// const autoImportMap = JSON.parse(await promises.readFile(new URL('../node_modules/@qso/app/dist/auto-import.json', import.meta.url), { encoding: 'utf-8' }))
const templates = (
  await promises.readdir(new URL('./src', import.meta.url), {
    withFileTypes: true
  })
)
  .filter((file) => file.isDirectory())
  .map((file) => file.name)

const input = templates.reduce((acc, cur) => {
  acc[cur] = new URL(`./src/${cur}/${cur}.ts`, import.meta.url).pathname
  return acc
}, {} as Record<string, string>)

function toPascalCase(text: string) {
  return text.replace(/(^\w|-\w)/g, clearAndUpper)
}
function clearAndUpper(text: string) {
  return text.replace(/-/, '').toUpperCase()
}

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        QuasarResolver()
        // {
        //   type: 'component',
        //   resolve: (name: string) => {
        //     if (components.includes(name))
        //       console.log(name)
        //     return { importName: name, path: 'quasar' }
        //   },
        // }
      ]
    })
  ],
  resolve: {
    alias: [
      {
        find: '@simsustech/simple-site-generator',
        replacement: new URL('../src', import.meta.url).pathname
      }
    ]
  },
  build: {
    // lib: {
    //   name: 'templates',
    //   entry: new URL('./index.ts', import.meta.url).pathname,
    //   formats: ['es'],
    //   // fileName: (format) => `templates.${format}.js'`
    // },
    outDir: 'dist',
    // emptyOutDir: false,

    rollupOptions: {
      preserveEntrySignatures: 'strict',
      input,
      external: ['vue', 'quasar', 'vue-router'],
      output: {
        entryFileNames: (chunkInfo) => `${chunkInfo.name}.js`,
        assetFileNames: '[name].[ext]',
        format: 'es'
      }
    }
  }
})
