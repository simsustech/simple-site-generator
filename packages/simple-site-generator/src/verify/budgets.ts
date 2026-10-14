/**
 * Transfer-size budgets.
 *
 * The tiered policy from the plan: byte budgets are **hard** failures because
 * they are deterministic and directly measurable, while Lighthouse performance
 * is a **warn** because it varies with machine and network simulation. A gate
 * that fails randomly gets disabled, so only the deterministic half blocks.
 */

import { promises as fs } from 'node:fs'
import { join, relative } from 'node:path'
import { gzipSync } from 'node:zlib'

export interface ResourceEntry {
  /**
   * Lighthouse's `resource-summary` resource type: `script`, `stylesheet`,
   * `image`, `font`, `document`, `media`, `other`, or the aggregate `total`.
   *
   * Aggregating by type rather than by URL matters: the per-request audit
   * (`network-requests`) only reports requests Lighthouse actually observed in
   * its trace, so a warm HTTP cache makes it under-report — and an under-reported
   * budget is a gate that passes when it should fail.
   */
  resourceType: string
  /** Bytes over the wire, as reported by Lighthouse's resource summary. */
  transferSize: number
}

export interface Budgets {
  /** Hard ceiling for transferred JavaScript, in bytes. */
  jsBytes: number
  /** Hard ceiling for transferred CSS, in bytes. */
  cssBytes: number
}

export const DEFAULT_BUDGETS: Budgets = {
  jsBytes: 250 * 1024,
  cssBytes: 60 * 1024
}

export interface BudgetResult {
  ok: boolean
  /** Total transferred bytes per resource type. */
  totals: { js: number; css: number }
  issues: string[]
}

function kindOf(resourceType: string): 'js' | 'css' | 'other' {
  if (resourceType === 'script') return 'js'
  if (resourceType === 'stylesheet') return 'css'

  return 'other'
}

export function formatBytes(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`
}

/**
 * Evaluate transferred bytes against the budgets.
 *
 * `transferSize` (compressed, over the wire) is used rather than decoded size,
 * because that is what the visitor actually pays for.
 */
export function evaluateBudgets(
  resources: ResourceEntry[],
  budgets: Budgets = DEFAULT_BUDGETS
): BudgetResult {
  let js = 0
  let css = 0

  for (const resource of resources) {
    const size = resource.transferSize ?? 0

    if (kindOf(resource.resourceType) === 'js') js += size
    else if (kindOf(resource.resourceType) === 'css') css += size
  }

  const issues: string[] = []

  if (js > budgets.jsBytes) {
    issues.push(
      `JavaScript budget exceeded: ${formatBytes(js)} transferred, budget is ${formatBytes(budgets.jsBytes)}`
    )
  }

  if (css > budgets.cssBytes) {
    issues.push(
      `CSS budget exceeded: ${formatBytes(css)} transferred, budget is ${formatBytes(budgets.cssBytes)}`
    )
  }

  return { ok: issues.length === 0, totals: { js, css }, issues }
}

/** Scores below these are a warning, not a failure (see the tiering note above). */

/**
 * Warn when a measured total is within this fraction of its ceiling.
 *
 * A budget a site is always near is a cliff: everything passes until the day a
 * dependency bump pushes it over, and then the failure looks sudden. A warning at
 * 10% remaining turns "no headroom" into something visible on every run.
 *
 * Deliberately not a failure. Being inside the budget is not a defect, and the
 * deterministic tier is reserved for things that are.
 */
export const HEADROOM_WARNING_FRACTION = 0.1

export function budgetHeadroomWarnings(
  totals: { js: number; css: number },
  budgets: Budgets = DEFAULT_BUDGETS,
  fraction: number = HEADROOM_WARNING_FRACTION
): string[] {
  const warnings: string[] = []

  const check = (label: string, actual: number, limit: number): void => {
    // A zero total is a failed measurement, which `evaluateTotals` already
    // reports as a failure; warning about its headroom would be noise on top.
    if (actual <= 0 || limit <= 0) return

    const remaining = (limit - actual) / limit

    if (remaining >= 0 && remaining <= fraction) {
      warnings.push(
        `${label} is within ${Math.round(fraction * 100)}% of its budget: ${formatBytes(actual)} of ${formatBytes(limit)}, ${formatBytes(limit - actual)} left`
      )
    }
  }

  check('JavaScript', totals.js, budgets.jsBytes)
  check('CSS', totals.css, budgets.cssBytes)

  return warnings
}
export const DEFAULT_SCORE_TARGETS = {
  /** Must equal `required` exactly — anything lower is a defect, not a trade-off. */
  required: { accessibility: 100, 'best-practices': 100, seo: 100 },
  /** A warning threshold: performance varies with the measuring machine. */
  warnBelow: { performance: 90 }
} as const

export interface ScoreResult {
  ok: boolean
  warnings: string[]
  issues: string[]
}

export function evaluateScores(
  scores: Record<string, number>,
  targets: {
    required: Record<string, number>
    warnBelow: Record<string, number>
  } = DEFAULT_SCORE_TARGETS as never
): ScoreResult {
  const issues: string[] = []
  const warnings: string[] = []

  for (const [category, minimum] of Object.entries(targets.required)) {
    const actual = scores[category]

    if (actual === undefined) continue

    if (actual < minimum) {
      issues.push(`${category} score is ${actual}, expected ${minimum}`)
    }
  }

  for (const [category, minimum] of Object.entries(targets.warnBelow)) {
    const actual = scores[category]

    if (actual === undefined) continue

    if (actual < minimum) {
      warnings.push(
        `${category} score is ${actual}, below the ${minimum} target`
      )
    }
  }

  return { ok: issues.length === 0, issues, warnings }
}

/**
 * Measure the transferred JavaScript and CSS of a built site **from disk**.
 *
 * This is deliberately not read from Lighthouse. Its `resource-summary` audit
 * reports `transferSize: 0` when the trace captures no network activity
 * (reproduced in a sandboxed Chromium), and a budget that measures nothing
 * silently reports "OK" — a gate that cannot fail is worse than no gate.
 * Reading the built files is deterministic, needs no browser, and lets the byte
 * half of `ssg verify` run with `--no-lighthouse`.
 *
 * Sizes are gzipped, because that is what actually crosses the network.
 */
export async function measureBuildAssets(root: string): Promise<{
  js: number
  css: number
  files: { file: string; bytes: number; type: 'js' | 'css' }[]
}> {
  const files: { file: string; bytes: number; type: 'js' | 'css' }[] = []

  async function walk(dir: string): Promise<void> {
    let entries

    try {
      entries = await fs.readdir(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      const full = join(dir, entry.name)

      if (entry.isDirectory()) {
        await walk(full)
        continue
      }

      const type: 'js' | 'css' | null = /\.(mjs|js)$/.test(entry.name)
        ? 'js'
        : entry.name.endsWith('.css')
          ? 'css'
          : null

      if (!type) continue

      const compressed = gzipSync(await fs.readFile(full)).length

      files.push({ file: relative(root, full), bytes: compressed, type })
    }
  }

  await walk(root)

  return {
    js: files
      .filter((f) => f.type === 'js')
      .reduce((total, f) => total + f.bytes, 0),
    css: files
      .filter((f) => f.type === 'css')
      .reduce((total, f) => total + f.bytes, 0),
    files: files.sort((a, b) => b.bytes - a.bytes)
  }
}

/**
 * Evaluate measured byte totals against the budgets.
 *
 * An all-zero measurement is **no measurement**, not a pass: a built site always
 * ships some JavaScript, so zero means the measurement failed.
 */
export function evaluateTotals(
  totals: { js: number; css: number },
  budgets: Budgets = DEFAULT_BUDGETS
): BudgetResult {
  if (totals.js + totals.css === 0) {
    return {
      ok: false,
      totals,
      issues: [
        'Byte measurement returned 0 bytes for both JavaScript and CSS — the budget gate cannot be trusted. Does the build output exist?'
      ]
    }
  }

  const issues: string[] = []

  if (totals.js > budgets.jsBytes) {
    issues.push(
      `JavaScript budget exceeded: ${formatBytes(totals.js)} transferred, budget is ${formatBytes(budgets.jsBytes)}`
    )
  }

  if (totals.css > budgets.cssBytes) {
    issues.push(
      `CSS budget exceeded: ${formatBytes(totals.css)} transferred, budget is ${formatBytes(budgets.cssBytes)}`
    )
  }

  return { ok: issues.length === 0, totals, issues }
}
