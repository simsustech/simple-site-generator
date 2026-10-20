import { promises as fs } from 'node:fs'
import { basename, resolve } from 'node:path'
import {
  renderDirectory,
  renderPackageJson,
  renderTsconfigJson
} from '@vitrify/tools/render'
import { confirm, input, rawlist } from '@inquirer/prompts'

/**
 * `ssg init` — scaffold a new site from the app template.
 *
 * Replaces the old `create-simple-site-generator` package. Prompts only when the
 * process is attached to a TTY **and** `--yes` was not passed, so an agent can
 * run it non-interactively and get the same project every time.
 */

export const TEMPLATES = ['docs', 'landing', 'business', 'plain'] as const

export type TemplateName = (typeof TEMPLATES)[number]

/** The template tree, shipped inside this package (`files: ["dist","templates"]`). */
const APP_TEMPLATE_URL = new URL('../../templates/app/', import.meta.url)

/**
 * Versions are pinned rather than looked up over the network.
 *
 * The old CLI called `latest-version` for every dependency, which made
 * scaffolding slow, network-dependent and non-reproducible. A static map means
 * `ssg init` works offline and two runs a month apart produce the same project.
 */
const DEPENDENCIES: Record<string, string> = {
  '@fastify/middie': '^9.0.1',
  '@fastify/static': '^8.0.3',
  '@quasar/extras': '^1.16.13',
  // No `@quasar/quasar-ui-qmarkdown`: the templates render the HTML that
  // `vite-plugin-markdown` produced at build time, so the application never
  // needs a Markdown parser in the browser. The prose styles still come from
  // the preset's ported selectors, which `appExtensions: ['qmarkdown']` in
  // `vitrify.config.ts` declares — that entry is a style name, not a package.
  '@quasar/quasar-ui-qmediaplayer': '^3.0.1',
  '@simple-site-generator/templates': '^0.1.19',
  quasar: '^2.32.3',
  'unocss-preset-quasar': '^0.7.0',
  'vite-plugin-pwa': '^1.0.0',
  vue: '^3.5.42',
  // Must match the ^5 range the templates package is built against, otherwise
  // the app installs a second, incompatible vue-router.
  'vue-router': '^5.3.1'
}

const DEV_DEPENDENCIES: Record<string, string> = {
  '@iconify-json/mdi': '^1.2.3',
  '@types/node': '^26.5.1',
  '@unocss/preset-icons': '^66.10.2',
  '@unocss/preset-web-fonts': '^66.10.2',
  '@vitejs/plugin-vue': '^6.0.9',
  '@vue/reactivity': '^3.5.42',
  '@vue/runtime-core': '^3.5.42',
  '@vue/runtime-dom': '^3.5.42',
  '@vue/server-renderer': '^3.5.42',
  '@vue/shared': '^3.5.42',
  beasties: '^0.3.0',
  devcert: '^1.2.2',
  fastify: '^5.2.1',
  'gray-matter': '^4.0.3',
  'icon-gen': '^5.0.0',
  'npm-run-all': '^4.1.5',
  oxfmt: '^0.68.0',
  oxlint: '^1.83.0',
  // TypeScript 7 is the native port and dropped the JS API that
  // @vue/compiler-sfc needs to resolve imported types in defineProps().
  typescript: '^6.0.3',
  unocss: '^66.10.2',
  vite: '^8.3.0',
  'vite-plugin-markdown': '^2.2.0',
  vitrify: '^0.28.1',
  'workbox-window': '^7.3.0'
}

const SCRIPTS: Record<string, string> = {
  dev: 'vitrify dev',
  'dev:ssr': 'vitrify dev -m ssr',
  build: 'run-s build:ssg',
  'build:csr': 'vitrify build',
  'build:ssr': 'vitrify build -m ssr',
  'build:ssg': 'vitrify build -m ssg',
  check: 'ssg check',
  // Build, then serve the result the way production does — extensionless URLs
  // and a real 404 — rather than `caddy file-server`, which has no `try_files`
  // and answers 404 for every page URL.
  preview:
    'pnpm run build && caddy run --config build/Caddyfile.preview --adapter caddyfile',
  verify: 'ssg verify',
  test: 'vitrify test',
  lint: 'oxlint src',
  'lint:fix': 'oxlint --fix src',
  'format:check': 'oxfmt --check .',
  'format:write': 'oxfmt --write .'
}

const TSCONFIG = {
  paths: { src: ['./src'] },
  types: ['vite/client', 'vitrify/client'],
  include: [
    'vitrify.config.ts',
    'src/**/*.ts',
    'src/**/*.d.ts',
    'src/**/*.tsx',
    'src/**/*.vue'
  ]
}

export interface InitOptions {
  /** Directory to create the project in. */
  directory?: string
  template?: TemplateName
  /** npm package name. */
  name?: string
  /** Displayed site name, used as the product name and default `<title>`. */
  productName?: string
  /** Absolute site origin, e.g. `https://example.com`. */
  url?: string
  description?: string
  author?: string
  /** Skip every prompt and use defaults. */
  yes?: boolean
  /** Force the interactive prompts even when stdin is not a TTY. */
  interactive?: boolean
}

export interface InitResult {
  directory: string
  template: TemplateName
}

function assertTemplate(value: string): TemplateName {
  if ((TEMPLATES as readonly string[]).includes(value)) {
    return value as TemplateName
  }

  throw new Error(
    `Unknown template "${value}". Valid templates: ${TEMPLATES.join(', ')}.`
  )
}

/**
 * Resolve options, prompting only when it is safe and wanted.
 *
 * A non-interactive run must never hang waiting on stdin, which is why the
 * `isTTY` check comes before any prompt.
 */
export async function resolveInitOptions(
  options: InitOptions
): Promise<Required<Omit<InitOptions, 'yes' | 'interactive'>>> {
  const directory = resolve(options.directory ?? '.')

  let template: TemplateName
  if (options.template) {
    template = assertTemplate(options.template)
  } else if (options.yes || !process.stdin.isTTY) {
    template = 'docs'
  } else {
    template = assertTemplate(
      await rawlist({
        message: 'Which template would you like to use?',
        choices: [
          { name: 'Documentation', value: 'docs' },
          { name: 'Landing page', value: 'landing' },
          { name: 'Local business', value: 'business' },
          { name: 'Plain service', value: 'plain' }
        ]
      })
    )
  }

  const fallbackName = basename(directory) || 'site'
  const interactive = !options.yes && process.stdin.isTTY

  const name =
    options.name ??
    (interactive
      ? await input({
          message: 'Package name',
          default: fallbackName,
          validate: (value: string) => Boolean(value?.length)
        })
      : fallbackName)

  const productName =
    options.productName ??
    (interactive
      ? await input({
          message: 'Site name',
          default: name,
          validate: (value: string) => Boolean(value?.length)
        })
      : name)

  const url =
    options.url ??
    (interactive
      ? await input({
          message: 'Website URL',
          default: 'https://example.com',
          validate: (value: string) => Boolean(value?.length)
        })
      : 'https://example.com')

  const description =
    options.description ??
    (interactive
      ? await input({
          message: 'Description',
          default: `${productName} website`
        })
      : `${productName} website`)

  const author =
    options.author ?? (interactive ? await input({ message: 'Author' }) : '')

  return { directory, template, name, productName, url, description, author }
}

export async function init(options: InitOptions = {}): Promise<InitResult> {
  const resolved = await resolveInitOptions(options)

  const outputDir = new URL(
    `./${basename(resolved.directory)}/`,
    new URL('', `file://${resolve(resolved.directory, '..')}/`)
  )

  const templateVariables = {
    template: resolved.template,
    // Only the `landing` module exports a `Landing` component, so only a landing
    // site's home page may name it. This used to be hardcoded in the scaffold's
    // `Index.md`, which meant a `business` or `docs` site shipped `page: Landing`
    // too -- and the router, having no such component, fell back to the generic
    // `Page` and rendered the wrong home page with no warning. Once an unknown
    // `page:` became a build failure, that scaffold could not build at all.
    landingPage: resolved.template === 'landing',
    name: resolved.name,
    productName: resolved.productName,
    url: resolved.url,
    description: resolved.description,
    author: resolved.author
  }

  await renderDirectory({
    directoryUrl: APP_TEMPLATE_URL,
    templateVariables,
    outputDir
  })

  await fs.writeFile(
    new URL('./package.json', outputDir),
    renderPackageJson({
      ...templateVariables,
      version: '0.1.0',
      license: 'UNLICENSED',
      scripts: SCRIPTS,
      dependencies: DEPENDENCIES,
      devDependencies: DEV_DEPENDENCIES,
      exports: {
        '.': {
          types: './dist/types/index.d.ts',
          import: './dist/index.js'
        }
      }
    })
  )

  await fs.writeFile(
    new URL('./tsconfig.json', outputDir),
    // `renderTsconfigJson` emits library defaults, including a `rootDir` of
    // `./src` — which the very same tsconfig includes `vitrify.config.ts`
    // outside of, so `tsc` fails every generated project with TS6059. A
    // generated app has no reason to pin a `rootDir`, so strip it.
    renderTsconfigJson(TSCONFIG).replace(/^\s*"rootDir": "\.\/src",\n/m, '')
  )

  return { directory: resolved.directory, template: resolved.template }
}

/** Confirm overwriting a non-empty directory (interactive runs only). */
export async function confirmOverwrite(directory: string): Promise<boolean> {
  try {
    const entries = await fs.readdir(directory)

    if (entries.length === 0) return true
  } catch {
    return true
  }

  if (!process.stdin.isTTY) {
    throw new Error(
      `${directory} is not empty. Refusing to overwrite a non-empty directory.`
    )
  }

  return confirm({
    message: `${directory} is not empty. Continue anyway?`,
    default: false
  })
}
