import { expect, test } from '@playwright/test'

/**
 * Harness proof for step 0 — the precondition for seam S4.
 *
 * Later e2e specs (steps 4, 5, 6) assume a working browser and a correctly
 * resolved `baseURL` against the built site. This spec proves both without
 * needing a server, so a failure here means "the harness is broken", never
 * "the template is broken".
 */
test('chromium launches and renders', async ({ page }) => {
  await page.goto('data:text/html,<h1>harness</h1>')

  await expect(page.locator('h1')).toHaveText('harness')
})

test('baseURL resolves to the statically served build origin', async ({
  baseURL
}) => {
  expect(baseURL).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/)
})
