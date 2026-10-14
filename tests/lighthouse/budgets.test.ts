import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  DEFAULT_BUDGETS,
  budgetHeadroomWarnings,
  evaluateScores,
  evaluateTotals,
  formatBytes,
  measureBuildAssets
} from '../../packages/simple-site-generator/src/verify/budgets.js'

/**
 * Seam S5 — the measured site's *policy*.
 *
 * The byte and score budgets are the half of `ssg verify` that decides pass or
 * fail, so they are tested directly rather than only through a Lighthouse run:
 * a budget gate that reads the wrong number, or that passes when it has no
 * number at all, is worse than no gate.
 */

let workspace: string

beforeAll(async () => {
  workspace = await mkdtemp(join(tmpdir(), 'ssg-budgets-'))
})

afterAll(async () => {
  await rm(workspace, { recursive: true, force: true })
})

/** Write a file into a temp build directory and return that directory. */
async function buildDir(
  files: Record<string, string>,
  name: string
): Promise<string> {
  const dir = join(workspace, name, 'static')
  await mkdir(join(dir, 'assets'), { recursive: true })

  for (const [file, contents] of Object.entries(files)) {
    await writeFile(join(dir, file), contents)
  }

  return dir
}

describe('measureBuildAssets', () => {
  it('sums gzipped JavaScript and CSS from the build output', async () => {
    // Highly compressible content, so the gzipped total is far below the raw.
    const js = 'console.log("x");\n'.repeat(2000)
    const css = '.a{color:red}\n'.repeat(2000)

    const dir = await buildDir(
      { 'index.mjs': js, 'assets/main.css': css },
      'measure'
    )

    const result = await measureBuildAssets(dir)

    expect(result.js).toBe(gzipSync(js).length)
    expect(result.css).toBe(gzipSync(css).length)
    // Gzip makes this far smaller than the raw bytes — the point of measuring it.
    expect(result.js).toBeLessThan(js.length / 10)
    expect(result.files.map((file) => file.type).sort()).toEqual(['css', 'js'])
  })

  it('returns zero for a directory that does not exist', async () => {
    const result = await measureBuildAssets(join(workspace, 'nope'))

    expect(result).toEqual({ js: 0, css: 0, files: [] })
  })

  it('ignores files that are neither JavaScript nor CSS', async () => {
    const dir = await buildDir(
      { 'index.html': '<h1>hi</h1>', 'img.png': 'not really a png' },
      'ignored'
    )

    const result = await measureBuildAssets(dir)

    expect(result.files).toEqual([])
  })
})

describe('evaluateTotals', () => {
  it('passes when both totals are inside budget', () => {
    const result = evaluateTotals(
      { js: 100 * 1024, css: 10 * 1024 },
      DEFAULT_BUDGETS
    )

    expect(result.ok).toBe(true)
    expect(result.issues).toEqual([])
    expect(result.totals).toEqual({ js: 100 * 1024, css: 10 * 1024 })
  })

  it('fails when JavaScript exceeds the budget, naming both numbers', () => {
    const result = evaluateTotals(
      { js: 300 * 1024, css: 1024 },
      DEFAULT_BUDGETS
    )

    expect(result.ok).toBe(false)
    expect(result.issues[0]).toMatch(/JavaScript budget exceeded/)
    expect(result.issues[0]).toContain('300.0 KB')
    expect(result.issues[0]).toContain('250.0 KB')
  })

  it('fails when CSS exceeds the budget', () => {
    const result = evaluateTotals({ js: 1024, css: 90 * 1024 }, DEFAULT_BUDGETS)

    expect(result.ok).toBe(false)
    expect(result.issues[0]).toMatch(/CSS budget exceeded/)
  })

  it('reports only the budgets that were actually exceeded', () => {
    const result = evaluateTotals(
      { js: 300 * 1024, css: 1024 },
      DEFAULT_BUDGETS
    )

    expect(result.issues).toHaveLength(1)
  })

  it('treats an all-zero measurement as a failure, not a pass', () => {
    // The regression this exists for: Lighthouse's resource summary reported
    // 0 bytes for a site that ships ~250 KB of JavaScript, and the budget
    // cheerfully reported "OK". A gate that cannot fail is worse than no gate.
    const result = evaluateTotals({ js: 0, css: 0 }, DEFAULT_BUDGETS)

    expect(result.ok).toBe(false)
    expect(result.issues[0]).toMatch(/cannot be trusted/)
  })

  it('honours custom budgets', () => {
    const result = evaluateTotals(
      { js: 200 * 1024, css: 1024 },
      {
        jsBytes: 100 * 1024,
        cssBytes: 60 * 1024
      }
    )

    expect(result.ok).toBe(false)
  })
})

describe('evaluateScores', () => {
  const perfect = {
    performance: 100,
    accessibility: 100,
    'best-practices': 100,
    seo: 100
  }

  it('passes a perfect site with no warnings', () => {
    const result = evaluateScores(perfect)

    expect(result.ok).toBe(true)
    expect(result.issues).toEqual([])
    expect(result.warnings).toEqual([])
  })

  it('fails when accessibility is not 100', () => {
    const result = evaluateScores({ ...perfect, accessibility: 87 })

    expect(result.ok).toBe(false)
    expect(result.issues[0]).toMatch(/accessibility score is 87/)
  })

  it('fails when SEO is not 100', () => {
    const result = evaluateScores({ ...perfect, seo: 82 })

    expect(result.ok).toBe(false)
    expect(result.issues[0]).toMatch(/seo score is 82/)
  })

  it('only warns on performance, because it varies by machine', () => {
    const result = evaluateScores({ ...perfect, performance: 60 })

    expect(result.ok).toBe(true)
    expect(result.issues).toEqual([])
    expect(result.warnings[0]).toMatch(/performance score is 60/)
  })

  it('ignores categories it has no target for', () => {
    const result = evaluateScores({ performance: 100, pwa: 10 })

    expect(result.ok).toBe(true)
    expect(result.warnings).toEqual([])
  })

  it('ignores a target whose score is missing', () => {
    const result = evaluateScores({ performance: 100 })

    expect(result.ok).toBe(true)
  })
})

describe('formatBytes', () => {
  it('reports kilobytes to one decimal place', () => {
    expect(formatBytes(1024)).toBe('1.0 KB')
    expect(formatBytes(250 * 1024)).toBe('250.0 KB')
  })
})

describe('budgetHeadroomWarnings', () => {
  const budgets = { jsBytes: 250 * 1024, cssBytes: 60 * 1024 }

  it('stays quiet when there is comfortable headroom', () => {
    // 192.6 KB of a 250 KB ceiling, which is what the reference site measures.
    expect(
      budgetHeadroomWarnings({ js: 197_222, css: 31 * 1024 }, budgets)
    ).toEqual([])
  })

  it('warns when JavaScript is within a tenth of the ceiling', () => {
    const warnings = budgetHeadroomWarnings(
      { js: 240 * 1024, css: 31 * 1024 },
      budgets
    )

    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('JavaScript is within 10% of its budget')
    expect(warnings[0]).toContain('10.0 KB left')
  })

  it('warns for CSS independently', () => {
    const warnings = budgetHeadroomWarnings(
      { js: 100 * 1024, css: 58 * 1024 },
      budgets
    )

    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('CSS is within 10%')
  })

  it('does not warn about a zero total, which is a failed measurement', () => {
    // `evaluateTotals` reports that as a failure; adding a headroom warning on
    // top would be noise pointing the reader at the wrong thing.
    expect(budgetHeadroomWarnings({ js: 0, css: 0 }, budgets)).toEqual([])
  })

  it('says nothing once the budget is exceeded, which is a failure instead', () => {
    expect(
      budgetHeadroomWarnings({ js: 260 * 1024, css: 31 * 1024 }, budgets)
    ).toEqual([])
  })

  it('takes the fraction as a parameter, so it is not a magic 10%', () => {
    expect(
      budgetHeadroomWarnings({ js: 200 * 1024, css: 0 }, budgets, 0.25)
    ).toHaveLength(1)
  })
})
