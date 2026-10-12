import { defineConfig, devices } from '@playwright/test'

/**
 * Seam S4 — the built site, served statically.
 *
 * `SSG_E2E_URL` points at the built `dist/static` output for whichever template
 * the current run is exercising, so one config serves all three templates
 * (steps 4, 5 and 6 each add a spec against this same baseURL).
 */
const baseURL = process.env.SSG_E2E_URL ?? 'http://127.0.0.1:4173'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'list' : 'line',
  use: {
    baseURL,
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})
