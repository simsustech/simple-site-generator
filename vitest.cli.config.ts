import { defineConfig } from 'vitest/config'

/**
 * Config for the CLI specs (seam S1) only.
 *
 * They spawn the `ssg` binary as a subprocess ~20 times. Run inside the shared
 * root config alongside the component suites they contend for CPU and time out
 * (measured: 59s and 10 spurious failures, versus 10s and 19 passes here), so
 * they get their own run — `pnpm run test:cli` — rather than being filtered out
 * of the shared include, which would leave the positional filter matching
 * nothing at all.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/cli/**/*.spec.ts'],
    reporters: 'default',
    // A subprocess suite is slower than a unit suite; the default 5s per test
    // is not enough when the machine is busy.
    testTimeout: 30_000,
    hookTimeout: 30_000
  }
})
