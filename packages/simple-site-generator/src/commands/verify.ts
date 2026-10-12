import { promises as fs } from 'node:fs'
import { join, matchesGlob, relative } from 'node:path'
import { appDir, distDir } from '../paths.js'
import {
  DEFAULT_BUDGETS,
  evaluateScores,
  evaluateTotals,
  formatBytes,
  measureBuildAssets,
  type Budgets
} from '../verify/budgets.js'
import { runLighthouse } from '../verify/lighthouse.js'
import { checkSeoSurface } from '../verify/seo-surface.js'
import { startStaticServer } from '../verify/serve.js'

export interface VerifyOptions {
  app?: string
  /** Absolute site origin, so canonical URLs can be checked against it. */
  siteUrl?: string
  budgets?: Budgets
  /**
   * Skip the Lighthouse half. Used where no Chromium is available — the
   * deterministic SEO/byte checks still run and still gate.
   */
  skipLighthouse?: boolean
  /**
   * Glob patterns, relative to the output root, of HTML files to leave out of
   * the SEO surface check. A third-party drop-in that happens to end in `.html`
   * (a Google site-verification file, for instance) is not a page and cannot
   * carry a title, canonical or JSON-LD.
   */
  ignore?: string[]
  /** Chromium binary for Lighthouse. */
  chromePath?: string
}

export interface VerifyResult {
  ok: boolean
  /** Hard failures — a non-zero exit. */
  issues: string[]
  /** Advisory: reported, but does not fail the run. */
  warnings: string[]
  report: {
    pages: number
    budgets: { js: number; css: number }
    scores?: Record<string, number>
  }
}

async function collectHtml(dir: string): Promise<string[]> {
  let entries

  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    throw new Error(
      `No build output at ${dir}. Run \`ssg build\` before \`ssg verify\`.`
    )
  }

  const files: string[] = []

  for (const entry of entries) {
    const full = join(dir, entry.name)

    if (entry.isDirectory()) files.push(...(await collectHtml(full)))
    else if (entry.name.endsWith('.html')) files.push(full)
  }

  return files
}

/**
 * `ssg verify` — prove the built site is correct and fast.
 *
 * Two tiers by design: the SEO surface and the byte budgets are deterministic
 * and **fail** the run; Lighthouse performance only **warns**, because it varies
 * with the measuring machine and a gate that fails randomly gets switched off.
 *
 * It does not build. `verify` measures what is on disk, so it can be run against
 * a deployed artifact as well as a local build.
 */
export async function verify(
  options: VerifyOptions = {}
): Promise<VerifyResult> {
  const app = options.app ?? appDir()
  const outputDir = distDir(app)
  const budgets = options.budgets ?? DEFAULT_BUDGETS

  const issues: string[] = []
  const warnings: string[] = []

  /** Measured transferred bytes, filled in below. */
  let budgetTotals = { js: 0, css: 0 }

  // --- SEO surface (deterministic, hard failure) --------------------------
  const ignore = options.ignore ?? []
  const htmlFiles = (await collectHtml(outputDir)).filter((file) => {
    const page = relative(outputDir, file).replace(/\\/g, '/')

    return !ignore.some((pattern) => matchesGlob(page, pattern))
  })

  if (htmlFiles.length === 0) {
    issues.push(`No HTML files found in ${outputDir}`)
  }

  for (const file of [...htmlFiles].sort((a, b) => a.localeCompare(b))) {
    const page = relative(outputDir, file)
    const html = await fs.readFile(file, 'utf8')

    for (const issue of checkSeoSurface(html, page, {
      siteUrl: options.siteUrl
    })) {
      issues.push(`${issue.page}: ${issue.message}`)
    }
  }

  // --- Byte budgets (deterministic, measured from the built files) -------
  // Measured from disk rather than from Lighthouse: the audit reports zero
  // bytes when its trace captures no network activity, and a budget that
  // measures nothing is a gate that cannot fail.
  const assets = await measureBuildAssets(outputDir)
  const budgetResult = evaluateTotals(
    { js: assets.js, css: assets.css },
    budgets
  )
  budgetTotals = budgetResult.totals

  if (!budgetResult.ok) {
    issues.push(...budgetResult.issues)
  } else {
    warnings.push(
      `Byte budgets OK: JS ${formatBytes(budgetTotals.js)} / ${formatBytes(budgets.jsBytes)}, CSS ${formatBytes(budgetTotals.css)} / ${formatBytes(budgets.cssBytes)}`
    )
  }

  if (assets.files.length) {
    const largest = assets.files
      .slice(0, 3)
      .map((file) => `${file.file} ${formatBytes(file.bytes)}`)
      .join(', ')
    warnings.push(`Largest assets: ${largest}`)
  }

  // --- Lighthouse scores (advisory for performance) ---------------------
  let scores: Record<string, number> | undefined

  if (htmlFiles.length > 0) {
    const server = await startStaticServer(outputDir)

    try {
      if (options.skipLighthouse) {
        warnings.push(
          'Lighthouse skipped (--no-lighthouse): scores not measured'
        )
      } else {
        const result = await runLighthouse(server.url, {
          chromePath: options.chromePath,
          formFactor: 'mobile'
        })

        scores = result.scores

        const scoreResult = evaluateScores(result.scores)

        for (const issue of scoreResult.issues) {
          const category = issue.split(' ')[0]
          const failing = result.failures?.[category]
          const detail = failing
            ?.map((id) =>
              result.details?.[id]?.length
                ? `${id} [${result.details[id].join(' | ')}]`
                : id
            )
            .join(', ')

          issues.push(detail ? `${issue} (failing audits: ${detail})` : issue)
        }
        warnings.push(...scoreResult.warnings)
      }
    } finally {
      await server.close()
    }
  }

  const ok = issues.length === 0

  // The report is written next to the build so CI can annotate it — a
  // terminal-only result is invisible to a pipeline.
  await fs
    .writeFile(
      join(outputDir, 'verify-report.json'),
      `${JSON.stringify({ ok, issues, warnings, pages: htmlFiles.length, budgets: budgetTotals, scores }, null, 2)}\n`,
      'utf8'
    )
    .catch(() => {
      // The report is a convenience; failing to write it must not fail verify.
    })

  return {
    ok,
    issues,
    warnings,
    report: { pages: htmlFiles.length, budgets: budgetTotals, scores }
  }
}
