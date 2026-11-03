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
  '@quasar/quasar-ui-qmediaplayer': '^3.0.2',
  // The kit packages are pinned to the release that ships this scaffold, not to
  // the first one that ever existed. A caret on a `0.x` version locks the minor
  // (`^0.2.0` means `>=0.2.0 <0.3.0`), so a scaffold pinned there installed kit
  // 0.2.0 two releases after 0.4.0 shipped — with the retired template names and
  // without a single fix. `tests/cli/init-templates.spec.ts` asserts these
  // against the versions in this workspace, so a release that forgets them fails
  // the suite instead of scaffolding a stale site.
  '@simple-site-generator/templates': '^0.5.0',
  quasar: '^2.35.2',
  'unocss-preset-quasar': '^0.7.4',
  'vite-plugin-pwa': '^2.0.0',
  vue: '^3.5.44',
  // Must match the ^5 range the templates package is built against, otherwise
  // the app installs a second, incompatible vue-router.
  'vue-router': '^5.4.0'
}

const DEV_DEPENDENCIES: Record<string, string> = {
  '@iconify-json/mdi': '^1.2.3',
  '@types/node': '^26.6.5',
  '@unocss/preset-icons': '^66.11.0',
  '@unocss/preset-web-fonts': '^66.11.0',
  '@vitejs/plugin-vue': '^6.0.10',
  '@vue/reactivity': '^3.5.44',
  '@vue/runtime-core': '^3.5.44',
  '@vue/runtime-dom': '^3.5.44',
  '@vue/server-renderer': '^3.5.44',
  '@vue/shared': '^3.5.44',
  beasties: '^0.5.5',
  devcert: '^1.2.3',
  fastify: '^5.12.7',
  'gray-matter': '^4.0.3',
  'icon-gen': '^5.0.0',
  'npm-run-all': '^4.1.5',
  oxfmt: '^0.74.0',
  oxlint: '^1.89.0',
  // The `ssg` binary the generated `check`, `build` and `verify` scripts call.
  // Without it a fresh project installs, then fails `pnpm check` with
  // "ssg: not found": the scripts reference a command nothing provides.
  'simple-site-generator': '^0.5.0',
  // TypeScript 7 is the native port and dropped the JS API that
  // @vue/compiler-sfc needs to resolve imported types in defineProps().
  typescript: '^6.0.3',
  unocss: '^66.11.0',
  vite: '^8.3.5',
  'vite-plugin-markdown': '^2.2.0',
  // Likewise locked to the minor: 0.32.0 is what hashes the client chunks, and
  // the scaffolded `@hashed` cache rule is only worth anything on that line.
  vitrify: '^0.32.0',
  'workbox-window': '^7.4.1'
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
  //
  // The last step is the script, not `caddy run`: a `:port` site block makes Caddy
  // print no URL, and two previews on one port both bind (`reuseport`). See
  // `scripts/preview.mjs`.
  preview: 'pnpm run build && node scripts/preview.mjs',
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
 * The hostname of a site origin, without the scheme or a trailing slash.
 *
 * `https://www.example.com/` becomes `www.example.com`. Caddy's site address and
 * the `/srv/<host>` target both want this shape; the site config wants the full
 * origin, which is why both variables exist.
 */
function hostOf(url: string): string {
  return url.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/\/+$/, '')
}

/**
 * What an npm package name may contain.
 *
 * The same shape npm enforces: lowercase, no spaces, no leading dot or
 * underscore. Vitrify reads `package.json`'s `name` and refuses an invalid one,
 * so a scaffold whose name came from a display name could not build at all.
 */
const PACKAGE_NAME = /^[a-z0-9][a-z0-9._-]*$/

/**
 * Turn a display name into a package name.
 *
 * `My Long Site Name` becomes `my-long-site-name`.
 * Accents are folded rather than dropped so `Café` becomes `cafe` and not `caf`.
 * An empty result (a name in a script with no Latin letters) falls back to the
 * directory name, which is what the scaffold used before this existed.
 */
function packageNameOf(displayName: string, fallback: string): string {
  const slug = displayName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug.length > 0 ? slug : fallback
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

  const productName =
    options.productName ??
    (interactive
      ? await input({
          message: 'Site name',
          default: options.name ?? fallbackName,
          validate: (value: string) => Boolean(value?.length)
        })
      : (options.name ?? fallbackName))

  /**
   * The npm package name, derived from the site name when not given.
   *
   * It is an identifier, not a display name: `--site-name "Example Co"` used to be
   * written into `package.json` as `name`, and vitrify then refused to build
   * ("Invalid name: Example Co"). A slug cannot carry that mistake, and the human
   * name still reaches `productName` and the document title.
   */
  const name =
    options.name ??
    (interactive
      ? await input({
          message: 'Package name',
          default: packageNameOf(productName, fallbackName),
          validate: (value: string) => PACKAGE_NAME.test(value)
        })
      : packageNameOf(productName, fallbackName))

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
    // Both modules that export a `Landing` component get the home page that
    // names it: `landing`, and `business` since its module grew one. A
    // scaffold that writes `page: Landing` for a module without it fails the
    // build (unknown component), so the flag follows the export, not the name.
    landingPage:
      resolved.template === 'landing' || resolved.template === 'business',
    name: resolved.name,
    productName: resolved.productName,
    /**
     * The same three values as ready-made JavaScript string literals.
     *
     * `renderDirectory` runs the scaffold through Handlebars, and `{{ value }}`
     * escapes for HTML. That is right for the Caddyfile and the workflow, and
     * wrong for every value that lands inside a JS string: a site named
     * a display name containing `&` was written into `vitrify.config.ts` as its
     * HTML entity, which then renders as `&amp;amp;` in `<title>` and puts
     * an escaped name in the JSON-LD and the sitemap. `JSON.stringify` produces
     * a literal that Handlebars inserts raw (`{{{ }}}` in the template), so
     * quotes and ampersands survive as themselves.
     */
    productNameLiteral: JSON.stringify(resolved.productName),
    urlLiteral: JSON.stringify(resolved.url),
    descriptionLiteral: JSON.stringify(resolved.description),
    url: resolved.url,
    // The bare host, for the two places that need a hostname and not an origin:
    // Caddy's site address and the `/srv/<host>` directory the site is served
    // from. Interpolating the origin into those wrote `root * /srv/https://…`
    // and rsynced into a directory literally named `https:`, which is not a
    // path any server has.
    host: hostOf(resolved.url),
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
