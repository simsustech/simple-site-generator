import { launch } from 'chrome-launcher'
import lighthouse from 'lighthouse'
import type { ResourceEntry } from './budgets.js'

/**
 * Run Lighthouse against a URL and return the parts `ssg verify` acts on.
 *
 * Lighthouse is used as a **library** rather than the CLI so the verification
 * runs in-process, reports its own scores, and does not require the caller to
 * have the `lighthouse` binary on `PATH`.
 */

export interface LighthouseVerification {
  scores: Record<string, number>
  resources: ResourceEntry[]
  /**
   * Failing audit ids per category. `verify` reports these next to a score so a
   * failed accessibility/SEO score names the audit that failed instead of only
   * the number — a bare "seo score is 82" is not actionable.
   */
  failures: Record<string, string[]>
  /** Failing-audit id to the selectors of the nodes that failed it. */
  details: Record<string, string[]>
}

export interface LighthouseOptions {
  /** Chromium/Chrome binary. Falls back to `CHROME_PATH`, then auto-detection. */
  chromePath?: string
  /** `mobile` (default) or `desktop` — the two form factors `verify` reports. */
  formFactor?: 'mobile' | 'desktop'
}

/**
 * Categories that must be measured. Performance is included because the plan
 * warns on it; `verify` decides what is fatal.
 */
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo']

export async function runLighthouse(
  url: string,
  options: LighthouseOptions = {}
): Promise<LighthouseVerification> {
  const chromePath = options.chromePath ?? process.env.CHROME_PATH

  if (!chromePath) {
    throw new Error(
      'No Chromium binary found. Set CHROME_PATH to a Chrome/Chromium executable (for example CHROME_PATH=/usr/bin/chromium ssg verify).'
    )
  }

  const chrome = await launch({
    chromePath,
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
  })

  try {
    const result = await lighthouse(
      url,
      {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: CATEGORIES
      },
      // Lighthouse 12+ expects the form factor in the config's settings.
      options.formFactor === 'desktop'
        ? {
            extends: 'lighthouse:default',
            settings: {
              formFactor: 'desktop',
              screenEmulation: {
                mobile: false,
                width: 1350,
                height: 940,
                deviceScaleFactor: 1,
                disabled: false
              }
            }
          }
        : { extends: 'lighthouse:default' }
    )

    if (!result) {
      throw new Error('Lighthouse returned no result')
    }

    const { lhr } = result

    const scores: Record<string, number> = {}
    const failures: Record<string, string[]> = {}

    for (const [key, category] of Object.entries(lhr.categories)) {
      const refs = category.auditRefs ?? []
      const failing = refs
        .map((ref) => lhr.audits[ref.id])
        .filter(
          (audit) =>
            audit &&
            audit.score !== null &&
            audit.score !== undefined &&
            audit.score < 1
        )
        .map((audit) => audit.id)

      if (failing.length) failures[key] = failing

      if (category.score === null || category.score === undefined) continue

      // Lighthouse reports 0–1; a 0–100 integer is what people compare against.
      scores[key] = Math.round(category.score * 100)
    }

    // The selector of the nodes behind each failing audit, so a failed
    // accessibility or SEO score points at an element instead of only an id.
    const details: Record<string, string[]> = {}

    for (const audit of Object.values(lhr.audits)) {
      if (
        !audit ||
        audit.score === null ||
        audit.score === undefined ||
        audit.score >= 1
      ) {
        continue
      }

      const items = (audit.details as { items?: unknown } | undefined)?.items
      const selectors = (Array.isArray(items) ? items : [])
        .map(
          (item) => (item as { node?: { selector?: string } }).node?.selector
        )
        .filter((selector): selector is string => Boolean(selector))
        .slice(0, 3)

      if (selectors.length) details[audit.id] = selectors
    }

    // Measured from `resource-summary`, which reports one row per resource TYPE
    // with a total `transferSize`. `network-requests` is not used: it only lists
    // requests Lighthouse observed in its own trace, so a warm cache makes it
    // under-report and the budget gate would pass vacuously.
    const summaryAudit = lhr.audits['resource-summary'] as
      | { details?: { items?: unknown[] } }
      | undefined

    const resources: ResourceEntry[] = (summaryAudit?.details?.items ?? [])
      .filter(
        (item): item is { resourceType: string; transferSize?: number } =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as { resourceType?: unknown }).resourceType === 'string'
      )
      .map((item) => ({
        resourceType: item.resourceType,
        transferSize: Number(item.transferSize) || 0
      }))

    return { scores, resources, failures, details }
  } finally {
    await chrome.kill()
  }
}
