/**
 * Type entry for `@simple-site-generator/templates/design`.
 *
 * The templates' design system, as UnoCSS configuration — no stylesheet. See
 * `../src/design.ts` for the values and the reasoning.
 */
import type { UserConfig } from 'unocss'

type Theme = NonNullable<UserConfig['theme']>
type Shortcuts = NonNullable<UserConfig['shortcuts']>
type Preflights = NonNullable<UserConfig['preflights']>

export const ssgTheme: Theme
export const ssgShortcuts: Shortcuts
export const ssgPreflights: Preflights
export const ssgSafelist: string[]

export const ssgUnoConfig: {
  theme: Theme
  shortcuts: Shortcuts
  preflights: Preflights
  safelist: string[]
}
