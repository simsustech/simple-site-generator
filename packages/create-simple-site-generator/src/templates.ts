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
        lint: 'eslint --ext .vue --ext .ts src',
        'lint:fix': 'eslint --ext .vue --ext .ts src --fix',
        'format:check': 'prettier --check .',
        'format:write': 'prettier --write .',
        'generate:icons':
          "icon-gen -i logo.svg -o public/ --favicon --favicon-name 'favicon-' --favicon-png-sizes '[32, 48, 96, 128, 256]'"
      },
      dependencies: {
        ...(await getLatestVersions([
          '@fastify/middie',
          '@fastify/static',
          '@quasar/extras',
          'quasar',
          'vue',
          'vue-router'
        ])),
        '@simple-site-generator/templates': '^0.1.0',
        '@quasar/quasar-ui-qmarkdown': '^2.0.0-beta.6',
        '@quasar/quasar-ui-qmediaplayer': '^2.0.0-beta.6'
      },
      devDependencies: {
        ...(await getLatestVersions([
          '@vitejs/plugin-vue',
          '@typescript-eslint/eslint-plugin',
          '@typescript-eslint/parser',
          '@types/node',
          '@vitrify/tools',
          'critters',
          'eslint',
          'eslint-config-prettier',
          'eslint-plugin-prettier-vue',
          'eslint-plugin-vue',
          'devcert',
          'fastify',
          'icon-gen',
          'npm-run-all',
          'typescript',
          'vite',
          'vitrify'
          // 'vite-plugin-markdown'
        ])),
        'vite-plugin-markdown': '2.2.0-2'
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
