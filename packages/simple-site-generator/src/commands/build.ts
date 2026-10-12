import { spawn } from 'node:child_process'
import { appDir, distDir } from '../paths.js'

export interface BuildOptions {
  app?: string
  /** Extra arguments forwarded to `vitrify build`. */
  passthrough?: string[]
}

export interface BuildResult {
  code: number
  outputDir: string
}

/**
 * `ssg build` — delegate to `vitrify build -m ssg`.
 *
 * Deliberately a thin wrapper: the build belongs to vitrify, and reimplementing
 * it here would fork the build pipeline from the one the dev server uses. The
 * value this command adds is the fixed SSG mode, the resolved output path, and a
 * single place for the agent-facing instructions to point at.
 */
export async function build(options: BuildOptions = {}): Promise<BuildResult> {
  const app = options.app ?? appDir()

  const args = ['vitrify', 'build', '-m', 'ssg', ...(options.passthrough ?? [])]

  const code = await new Promise<number>((done, fail) => {
    const child = spawn('npx', args, { cwd: app, stdio: 'inherit' })

    child.once('error', fail)
    child.once('close', (exitCode) => done(exitCode ?? 1))
  })

  return { code, outputDir: distDir(app) }
}
