import { afterAll } from 'vitest'

/**
 * Let Quasar's pending meta update run before the environment is destroyed.
 *
 * `useSeo` reaches Quasar's `Meta`, which does not write the document
 * synchronously: `planClientUpdate` schedules `setTimeout(updateClientMeta, 50)`
 * and only then touches `document.title` and `document.head`. Vitest tears the
 * happy-dom environment down as soon as a test file finishes, so a file that
 * mounts a component and finishes inside those 50 ms leaves the timer pending —
 * it then fires with no `document`, and vitest reports the ReferenceError as an
 * uncaught exception against whichever file happens to be running. Measured
 * before this file existed: `Errors 1 error`, attributed to `hero-demo.test.ts`
 * one run and `site-shell.test.ts` the next.
 *
 * One wait per *file* is enough: the timer is scheduled per mount, but the
 * danger window is the end of the file, and the delay is 50 ms. `afterAll`
 * rather than `afterEach` keeps the cost at 75 ms per file instead of per test.
 *
 * The alternative — stubbing `Meta` in the mount helper — was rejected: the
 * suite is asserting what a page tells a search engine, and a stub would make
 * those assertions test the stub.
 */
const QUASAR_META_DELAY_MS = 50
const MARGIN_MS = 25

afterAll(async () => {
  await new Promise((resolve) =>
    setTimeout(resolve, QUASAR_META_DELAY_MS + MARGIN_MS)
  )
})
