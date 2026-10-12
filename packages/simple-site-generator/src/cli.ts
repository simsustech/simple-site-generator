#!/usr/bin/env node
import { basename, resolve } from 'node:path'
import parseArgs from 'minimist'
import { addPage } from './commands/add-page.js'
import { build } from './commands/build.js'
import { check } from './commands/check.js'
import { TEMPLATES, confirmOverwrite, init } from './commands/init.js'
import { verify } from './commands/verify.js'
import { DEFAULT_BUDGETS } from './verify/budgets.js'
import type { PageTag } from './pages/page-schema.js'

/**
 * `ssg` — the command surface the agent instructions point at.
 *
 * Every command prints a machine-readable result on failure and exits non-zero,
 * so an agent (or CI) can act on the outcome without parsing prose.
 */

const USAGE = `ssg — simple site generator

Usage:
  ssg init [directory]      Scaffold a new site
  ssg add-page <id>         Create a page with valid frontmatter
  ssg check                 Validate every page's frontmatter
  ssg build                 Build the static site (vitrify build -m ssg)
  ssg verify                Verify the built site (SEO surface, budgets, Lighthouse)

Options:
  --template <name>         ${TEMPLATES.join(' | ')} (default: docs)
  --site-name <name>        Displayed site name
  --url <origin>            Absolute site origin, e.g. https://example.com
  --title <title>           add-page: page title
  --description <text>      add-page: meta description
  --tags <a,b>              add-page: comma-separated tags (${['menu', 'footer', 'contact'].join(', ')})
  --page <component>        add-page: template component, e.g. Landing
  --yes                     Never prompt; use defaults
  --no-lighthouse           verify: skip Lighthouse (deterministic checks only)
  --js-budget <kb>          verify: JavaScript budget in KB (default 250)
  --css-budget <kb>         verify: CSS budget in KB (default 60)
  -h, --help                Show this message
`

async function main(argv: string[]): Promise<number> {
  const [command, positional] = argv

  if (!command || command === '--help' || command === '-h') {
    process.stdout.write(USAGE)

    return command ? 0 : 1
  }

  const args = parseArgs(argv.slice(1), {
    string: [
      'template',
      'site-name',
      'url',
      'title',
      'description',
      'tags',
      'page'
    ],
    boolean: ['yes', 'lighthouse', 'help'],
    default: { lighthouse: true },
    alias: { h: 'help' }
  })

  switch (command) {
    case 'init': {
      const directory = resolve(positional ?? args._[0] ?? '.')

      if (!(await confirmOverwrite(directory))) {
        process.stdout.write('Aborted.\n')

        return 1
      }

      const result = await init({
        directory,
        template: args.template,
        name: args['site-name'],
        productName: args['site-name'],
        url: args.url,
        yes: args.yes
      })

      process.stdout.write(
        `Created ${result.template} site in ${result.directory}\n` +
          `Next: cd ${basename(result.directory)} && pnpm install && pnpm check\n`
      )

      return 0
    }

    case 'add-page': {
      const id = positional

      if (!id) {
        process.stderr.write(
          'add-page requires a page id, e.g. `ssg add-page about`\n'
        )

        return 1
      }

      const tags = args.tags
        ? (args.tags.split(',').map((tag: string) => tag.trim()) as PageTag[])
        : undefined

      const result = await addPage({
        id,
        title: args.title,
        description: args.description,
        tags,
        page: args.page
      })

      process.stdout.write(`Created ${result.file}\n`)

      return 0
    }

    case 'check': {
      const result = await check()

      if (result.pages === 0) {
        process.stdout.write(
          'No pages found in src/pages — add one with `ssg add-page home`.\n'
        )

        return 0
      }

      if (result.ok) {
        process.stdout.write(`Checked ${result.pages} page(s): OK\n`)

        return 0
      }

      process.stderr.write(
        `Checked ${result.pages} page(s): ${result.issues.length} issue(s)\n`
      )

      for (const issue of result.issues) {
        process.stderr.write(`  ${issue.file}: ${issue.message}\n`)
      }

      return 1
    }

    case 'build': {
      const result = await build()

      if (result.code !== 0) {
        process.stderr.write(`Build failed (exit ${result.code})\n`)

        return result.code
      }

      process.stdout.write(`Built to ${result.outputDir}\n`)
      process.stdout.write('Next: ssg verify\n')

      return 0
    }

    case 'verify': {
      const result = await verify({
        skipLighthouse: args.lighthouse === false,
        siteUrl: args.url,
        budgets:
          args['js-budget'] || args['css-budget']
            ? {
                jsBytes:
                  Number(args['js-budget'] ?? DEFAULT_BUDGETS.jsBytes / 1024) *
                  1024,
                cssBytes:
                  Number(
                    args['css-budget'] ?? DEFAULT_BUDGETS.cssBytes / 1024
                  ) * 1024
              }
            : undefined
      })

      for (const warning of result.warnings) {
        process.stdout.write(`  note: ${warning}\n`)
      }

      if (!result.ok) {
        process.stderr.write(
          `Verification failed: ${result.issues.length} issue(s)\n`
        )

        for (const issue of result.issues) {
          process.stderr.write(`  ${issue}\n`)
        }

        return 1
      }

      process.stdout.write(
        `Verified ${result.report.pages} page(s): OK${
          result.report.scores
            ? ` (${Object.entries(result.report.scores)
                .map(([key, value]) => `${key} ${value}`)
                .join(', ')})`
            : ''
        }\n`
      )

      return 0
    }

    default:
      process.stderr.write(`Unknown command "${command}"\n\n${USAGE}`)

      return 1
  }
}

try {
  process.exitCode = await main(process.argv.slice(2))
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`
  )
  process.exitCode = 1
}
