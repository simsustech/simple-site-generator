import latestVersion from 'latest-version'

const getLatestVersions = async (dependencies: string[]) => {
  console.log('Fetching latest package versions...')
  const deps: Record<string, string> = {}
  for (const dep of dependencies) {
    deps[dep] = await latestVersion(dep)
  }
  return deps
}

interface Templates {
  [key: string]: {
    name: string
    fullName: string
    description: string
    url: URL
    pkgJson: {
      scripts: Record<string, string>
      exports?: Record<string, { types?: string; import: string; src?: string }>
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
      peerDependencies?: Record<string, string>
    }
    tsconfigJson: {
      paths?: Record<string, string[]>
      types?: string[]
      include?: string[]
    }
  }
}

export const templates: Templates = {
  simpleSiteGenerator: {
    name: 'simpleSiteGenerator',
    fullName: 'Simple Site Generator Project',
    description: 'Simple Site Generator Project project',
    url: new URL('../templates/app/', import.meta.url),
    pkgJson: {
      scripts: {
        dev: 'vitrify dev',
        'dev:ssr': 'vitrify dev -m ssr',
        build: 'run-s build:ssg',
        'build:csr': 'vitrify build',
        'build:ssr': 'vitrify build -m ssr',
        'build:ssg': 'vitrify build -m ssg',
        test: 'vitrify test',
        lint: 'oxlint src',
        'lint:fix': 'oxlint --fix src',
        'format:check': 'oxfmt --check .',
        'format:write': 'oxfmt --write .',
        'generate:icons':
          "icon-gen -i logo.svg -o public/ --favicon --favicon-name 'favicon-' --favicon-png-sizes '[32, 48, 96, 128, 256]'"
      },
      dependencies: {
        ...(await getLatestVersions([
          '@fastify/middie',
          '@fastify/static',
          '@quasar/extras',
          'quasar',
          'vite-plugin-pwa',
          'vue',
          'vue-router',
          '@simple-site-generator/templates',
          '@quasar/quasar-ui-qmarkdown'
        ])),
        '@quasar/quasar-ui-qmediaplayer': '^2.0.0-beta.6'
      },
      devDependencies: {
        ...(await getLatestVersions([
          '@iconify-json/mdi',
          '@vitejs/plugin-vue',
          '@types/node',
          '@vue/reactivity',
          '@vue/runtime-core',
          '@vue/runtime-dom',
          '@vue/server-renderer',
          '@vue/shared',
          '@unocss/preset-icons',
          '@unocss/preset-web-fonts',
          'animated-unocss',
          'beasties',
          'devcert',
          'fastify',
          'icon-gen',
          'npm-run-all',
          'oxfmt',
          'oxlint',
          'unocss',
          'vite',
          'vitrify',
          'workbox-window',
          'vite-plugin-markdown'
        ])),
        // TypeScript 7 is the native (Go) port and dropped the JS API that
        // @vue/compiler-sfc uses to resolve imported types in defineProps().
        typescript: '^6.0.3'
      },
      exports: {
        '.': {
          types: './dist/types/index.d.ts',
          import: './dist/index.js'
        },
        './fastify-ssr-plugin': {
          import: './dist/ssr/server/fastify-ssr-plugin.mjs'
        },
        './hooks': {
          import: './dist/ssr/server/virtual_vitrify-hooks.mjs'
        }
      }
    },
    tsconfigJson: {
      paths: {
        src: ['./src']
      },
      types: ['vite/client', 'vitrify/client'],
      include: [
        'vitrify.config.ts',
        'src/**/*.ts',
        'src/**/*.d.ts',
        'src/**/*.tsx',
        'src/**/*.vue'
      ]
    }
  }
  // plugin: {
  //   name: 'quasar-plugin',
  //   fullName: 'Quasar Plugin',
  //   description: 'Quasar Framework plugin',
  //   url: new URL('../templates/quasar-plugin/', import.meta.url)
  // },
  // quasarMonorepo: {
  //   name: 'quasar-monorepo',
  //   fullName: 'Quasar monorepo (project + plugin)',
  //   description: 'Quasar Framework monorepo',
  //   url: new URL('../templates/quasar-monorepo/', import.meta.url)
  // }
}
