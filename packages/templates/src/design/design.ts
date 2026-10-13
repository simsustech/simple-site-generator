import type { UserConfig } from 'unocss'

/**
 * The templates' design system, expressed entirely as UnoCSS configuration.
 *
 * There is no stylesheet: the scale lives in the UnoCSS `theme` (so it produces
 * utilities like `text-step-3`, `py-space-5`, `max-w-content`), the recurring
 * compositions are `shortcuts` (so the markup keeps its readable `ssg-*` class
 * names), and the handful of rules that *must* be element- or media-scoped —
 * which no utility can express — are `preflights`.
 *
 * Colour, elevation and radii are **not** hard-coded: they read the MD3 role
 * tokens that `unocss-preset-quasar` publishes (`--q-primary`,
 * `--q-secondary-container`, `--q-surface-container*`, `--q-outline-variant`,
 * `--q-elevation-level*`, `--q-card-radius`). The app sets one source colour and
 * the whole template re-themes — including dark mode, because those tokens
 * switch with `body--dark`.
 *
 * The app wires it in beside `unocss-preset-quasar`:
 *
 * ```ts
 * vitrify: { unocss: { presets: [QuasarPreset({ … })], ...ssgUnoConfig } }
 * ```
 */

type Theme = NonNullable<UserConfig['theme']>
type Shortcuts = NonNullable<UserConfig['shortcuts']>
type Preflights = NonNullable<UserConfig['preflights']>

/**
 * Fluid type and spacing. `clamp()` means no layout shift between breakpoints,
 * and the values are the ones the templates were designed against.
 */
const STEP = {
  '-1': 'clamp(0.83rem, 0.8rem + 0.17vw, 0.94rem)',
  '0': 'clamp(1rem, 0.96rem + 0.2vw, 1.13rem)',
  '1': 'clamp(1.25rem, 1.18rem + 0.35vw, 1.5rem)',
  '2': 'clamp(1.56rem, 1.44rem + 0.6vw, 2rem)',
  '3': 'clamp(1.95rem, 1.75rem + 1vw, 2.75rem)',
  '4': 'clamp(2.44rem, 2.1rem + 1.7vw, 3.75rem)'
} as const

const SPACE = {
  '1': '0.5rem',
  '2': '0.75rem',
  '3': '1rem',
  '4': 'clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem)',
  '5': 'clamp(2.5rem, 2rem + 2.5vw, 4.5rem)'
} as const

/** MD3 role tokens published by `unocss-preset-quasar`. */
const PRIMARY = 'var(--q-primary)'
const ON_PRIMARY = 'var(--q-on-primary)'
const ON_SURFACE = 'var(--q-on-surface)'
const ON_SURFACE_VARIANT = 'var(--q-on-surface-variant)'
const SURFACE_LOW = 'var(--q-surface-container-low)'
const SURFACE_LOWEST = 'var(--q-surface-container-lowest)'
const SURFACE_CONTAINER = 'var(--q-surface-container)'
const SECONDARY_CONTAINER = 'var(--q-secondary-container)'
const ON_SECONDARY_CONTAINER = 'var(--q-on-secondary-container)'
const OUTLINE_VARIANT = 'var(--q-outline-variant)'
const ELEVATION_1 = 'var(--q-elevation-level1)'
const ELEVATION_2 = 'var(--q-elevation-level2)'
const CARD_RADIUS = 'var(--q-card-radius)'

export const ssgTheme: Theme = {
  fontSize: Object.fromEntries(
    Object.entries(STEP).map(([key, value]) => [`step-${key}`, value])
  ),
  spacing: Object.fromEntries(
    Object.entries(SPACE).map(([key, value]) => [`space-${key}`, value])
  ),
  borderRadius: { DEFAULT: '0.5rem' },
  maxWidth: { measure: '68ch', content: '1120px' }
}

/** Shared layout primitives, plus one entry per component class in the markup. */
export const ssgShortcuts: Shortcuts = [
  // Shared. The page is tinted, not white: the surface roles MD3 derives from a
  // saturated source are near-white, so the shell uses `container-low` and the
  // panels use the tint that actually reads as colour.
  ['ssg-shell', `block bg-[${SURFACE_LOW}] text-[${ON_SURFACE}]`],
  [
    'ssg-skip-link',
    'absolute left-[-9999px] top-0 z-3000 px-space-3 py-space-2 bg-white text-black font-600 underline'
  ],
  ['ssg-prose', 'max-w-measure text-step-0 leading-[1.65]'],
  ['ssg-section', 'py-space-5'],
  ['ssg-section__inner', 'w-full max-w-content mx-auto px-space-3'],
  ['ssg-muted-surface', `bg-[${SURFACE_CONTAINER}]`],
  [
    'ssg-sr-only',
    'absolute w-1px h-1px p-0 m-[-1px] overflow-hidden [clip-path:inset(50%)] whitespace-nowrap b-0'
  ],

  // Header — a solid brand bar, so the site reads as designed at a glance.
  ['ssg-header', `bg-[${PRIMARY}] text-[${ON_PRIMARY}]`],
  ['ssg-header__inner', 'w-full max-w-content mx-auto px-space-3'],
  ['ssg-header__toolbar', 'gap-space-2'],
  [
    'ssg-header__brand',
    `inline-flex items-center gap-space-2 no-underline text-[${ON_PRIMARY}] font-700 text-step-1`
  ],
  ['ssg-header__logo', 'block w-40px h-40px'],
  ['ssg-header__brand-name', 'whitespace-nowrap'],
  ['ssg-header__nav', 'hidden items-center gap-space-1 lg:flex'],

  // Shell
  ['ssg-shell__drawer-link', 'block w-full text-inherit no-underline'],

  // Footer — dark green, so the page is bookended by the brand rather than
  // fading into white.
  [
    'ssg-footer',
    `px-space-3 pt-space-4 pb-space-3 bg-[${PRIMARY}] text-[${ON_PRIMARY}]`
  ],
  [
    'ssg-footer__inner',
    'flex flex-wrap gap-space-4 w-full max-w-content mx-auto'
  ],
  ['ssg-footer__nav', 'flex-[1_1_12rem] min-w-0'],
  ['ssg-footer__contact', 'flex-[1_1_12rem] min-w-0'],
  ['ssg-footer__social', 'flex-[1_1_12rem] min-w-0'],
  ['ssg-footer__heading', `text-[${ON_PRIMARY}] text-step-0 m-0 mb-space-1`],
  [
    'ssg-footer__list',
    '[list-style-type:none] m-0 p-0 flex flex-col gap-space-1 text-step--1'
  ],
  ['ssg-footer__list--inline', 'flex-row gap-space-3'],
  ['ssg-footer__link', `text-[${ON_PRIMARY}] underline`],
  ['ssg-footer__sr', 'ssg-sr-only'],
  [
    'ssg-footer__legal',
    'w-full max-w-content mx-auto mt-space-4 px-space-3 text-step--1 opacity-80'
  ],

  // Hero
  ['ssg-hero', 'py-space-5'],
  [
    'ssg-hero--tinted',
    `bg-[${SECONDARY_CONTAINER}] text-[${ON_SECONDARY_CONTAINER}]`
  ],
  [
    'ssg-hero__inner',
    'flex flex-wrap items-center gap-space-4 w-full max-w-content mx-auto px-space-3'
  ],
  ['ssg-hero__copy', 'flex-[1_1_22rem] min-w-0'],
  ['ssg-hero__aside', 'flex-[1_1_18rem] min-w-0'],
  [
    'ssg-hero__title',
    'text-inherit text-step-4 leading-[1.1] m-0 [text-wrap:balance]'
  ],
  [
    'ssg-hero__tagline',
    'text-inherit opacity-85 text-step-1 leading-[1.5] mt-space-3 mb-0 max-w-[40ch]'
  ],
  ['ssg-hero__actions', 'flex flex-wrap items-center gap-space-3 mt-space-4'],

  // Bento grid — white cards on the tinted page, primary icons and links.
  // `ssg-bento` drops the section's top padding: the heading above the grid
  // already provides that space, and both together left a large gap.
  ['ssg-bento', 'pt-0'],
  ['ssg-bento__header', 'max-w-measure mb-space-4'],
  ['ssg-bento__heading', `text-[${ON_SURFACE}] text-step-3 leading-[1.15] m-0`],
  [
    'ssg-bento__lede',
    `text-[${ON_SURFACE_VARIANT}] text-step-1 mt-space-2 mb-0`
  ],
  [
    'ssg-bento__grid',
    'grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-space-4'
  ],
  [
    'ssg-bento__tile',
    `p-space-4 rounded-[${CARD_RADIUS}] bg-[${SURFACE_LOWEST}] b b-solid b-[${OUTLINE_VARIANT}] shadow-[${ELEVATION_1}] transition-shadow duration-200 hover:shadow-[${ELEVATION_2}]`
  ],
  ['ssg-bento__icon', `text-[${PRIMARY}] text-step-3`],
  [
    'ssg-bento__tile-header',
    `text-[${ON_SURFACE}] text-step-1 mt-space-2 mb-space-1`
  ],
  ['ssg-bento__tile-content', `text-[${ON_SURFACE_VARIANT}] m-0 leading-[1.6]`],
  ['ssg-bento__link', `text-[${PRIMARY}] inline-block mt-space-2 font-600`],

  // Proof section
  [
    'ssg-proof-section__heading',
    `text-[${ON_SURFACE}] text-step-3 m-0 mb-space-4`
  ],
  [
    'ssg-proof-section__grid',
    'grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-space-4'
  ],
  ['ssg-proof-section__review', 'm-0 mb-space-3'],
  [
    'ssg-proof-section__text',
    `text-[${ON_SURFACE_VARIANT}] text-step-1 leading-[1.6] m-0`
  ],
  [
    'ssg-proof-section__attribution',
    `text-[${ON_SURFACE_VARIANT}] mt-space-1 text-step--1`
  ],
  ['ssg-proof-section__rating', `text-[${PRIMARY}] ms-space-2`],
  ['ssg-proof-section__sr', 'ssg-sr-only'],
  [
    'ssg-proof-section__facts-heading',
    `text-[${ON_SURFACE}] text-step-0 m-0 mb-space-2`
  ],
  ['ssg-proof-section__list', `text-[${ON_SURFACE_VARIANT}] m-0 text-step--1`],
  ['ssg-proof-section__link', `text-[${PRIMARY}]`],

  // Proof strip
  ['ssg-proof', 'flex items-center gap-space-1 mt-space-2 mb-0 text-step--1'],
  ['ssg-proof__stars', `text-[${PRIMARY}] tracking-[0.1em]`],

  // FAQ
  ['ssg-faq__heading', `text-[${ON_SURFACE}] text-step-3 m-0 mb-space-4`],
  ['ssg-faq__list', 'max-w-measure'],
  ['ssg-faq__item', `b-b b-b-solid b-[${OUTLINE_VARIANT}]`],
  [
    'ssg-faq__question',
    `text-[${ON_SURFACE}] py-space-3 text-step-1 font-600 cursor-pointer`
  ],
  [
    'ssg-faq__answer',
    `text-[${ON_SURFACE_VARIANT}] m-0 mb-space-3 leading-[1.65]`
  ],

  // Breadcrumbs
  ['ssg-breadcrumbs', `text-[${ON_SURFACE_VARIANT}] text-step--1 mb-space-2`],
  [
    'ssg-breadcrumbs__list',
    'flex flex-wrap gap-space-1 m-0 p-0 [list-style-type:none]'
  ],
  ['ssg-breadcrumbs__item', 'inline-flex gap-space-1'],
  ['ssg-breadcrumbs__link', `text-[${PRIMARY}]`],

  // CTA
  [
    'ssg-cta--secondary',
    `text-[${PRIMARY}] inline-flex items-center gap-space-1 text-step-0 font-600 underline`
  ],

  // Page content
  ['ssg-content__media', 'w-full max-w-[1120px]'],
  [
    'ssg-content__caption',
    'absolute top-0 inset-x-0 p-space-2 text-center text-white bg-[rgb(0_0_0_/_55%)]'
  ],
  // The page's primary action, shown in the title band.
  ['ssg-page-header__cta', 'mt-space-4'],

  // Landing
  [
    'ssg-landing__final-heading',
    `text-[${ON_SURFACE}] text-step-3 m-0 mb-space-3`
  ],
  ['ssg-landing__final-proof', 'mt-space-3'],
  ['ssg-landing__header', pageHeader()],
  ['ssg-landing__title', pageTitle()],
  ['ssg-landing__lede', pageLede()],

  // Docs
  ['ssg-docs__header', pageHeader()],
  ['ssg-docs__title', pageTitle()],
  ['ssg-docs__lede', pageLede()],

  // Business
  ['ssg-business__header', pageHeader()],
  ['ssg-business__title', pageTitle()],
  ['ssg-business__lede', pageLede()],
  ['ssg-business__cards', 'mt-space-5'],
  [
    'ssg-business__cards-heading',
    `text-[${ON_SURFACE}] text-step-2 m-0 mb-space-3`
  ]
]

/**
 * The page's title band: a tinted primary panel with an accent rule, so a page
 * opens with colour and structure instead of a wall of white.
 */
function pageHeader(): string {
  return `bg-[${SECONDARY_CONTAINER}] text-[${ON_SECONDARY_CONTAINER}] p-space-4 rounded-[${CARD_RADIUS}] b-s-4 b-s-solid b-s-[${PRIMARY}] mb-space-5`
}

function pageTitle(): string {
  return 'text-inherit text-step-3 leading-[1.15] m-0 font-700'
}

function pageLede(): string {
  return 'text-inherit opacity-85 text-step-1 mt-space-2 mb-0 max-w-measure'
}

/**
 * The rules a utility cannot express: `:where()`/descendant selectors,
 * `:focus` states and a media query. UnoCSS emits these as preflights, so they
 * travel with the configuration rather than a stylesheet.
 */
export const ssgPreflights: Preflights = [
  {
    getCSS: () => `
/* One visible focus ring everywhere; never remove focus styling. */
:where(a, button, [tabindex]):focus-visible {
  outline: 3px solid var(--q-primary, currentColor);
  outline-offset: 2px;
  border-radius: 2px;
}

.ssg-skip-link:focus {
  left: 0;
}

/* The header is a brand bar. A utility cannot colour it: Quasar's own
   q-header rule wins the cascade for the element, so the background is set
   here where the specificity is explicit. */
.q-header.ssg-header,
.ssg-header.q-header {
  background: var(--q-primary, #1976d2);
  color: var(--q-on-primary, #ffffff);
}

.ssg-header .q-btn,
.ssg-header .q-btn-dropdown,
.ssg-header .q-icon {
  color: var(--q-on-primary, #ffffff);
}

/* The layout already offsets for the header; the page container must not add it. */
.ssg-shell .q-page-container {
  padding-top: 0;
}

#main {
  display: block;
  outline: none;
}

#main:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: -3px;
}

/* Markdown headings inside prose (QMarkdown emits bare h2/h3). */
.ssg-prose :where(h2) {
  font-size: ${STEP['2']};
  margin-block: ${SPACE['4']} ${SPACE['2']};
}

.ssg-prose :where(h3) {
  font-size: ${STEP['1']};
  margin-block: ${SPACE['3']} ${SPACE['2']};
}

.ssg-prose :where(a) {
  color: var(--q-primary, currentColor);
}

/* Markdown images: content-width, rounded, and never wider than the column. */
.ssg-prose :where(img) {
  display: block;
  width: 100%;
  height: auto;
  margin-block: ${SPACE['4']};
  border-radius: var(--q-card-radius, 0.5rem);
}

/* Blockquotes read as a pull-quote with the brand rule. */
.ssg-prose :where(blockquote) {
  margin-inline: 0;
  padding-inline-start: ${SPACE['3']};
  border-inline-start: 4px solid var(--q-primary, currentColor);
  color: var(--q-on-surface-variant, inherit);
}

/* The hero image is the LCP element: block-level, full width, rounded. */
.ssg-hero__image img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
}

/* Definition-list terms in the proof section. */
.ssg-proof-section__list dt {
  font-weight: 600;
  margin-top: ${SPACE['2']};
}

.ssg-proof-section__list dd {
  margin: 0;
}

/* Sticky mobile action bar: below lg only. */
.ssg-sticky-cta {
  display: none;
}

@media (max-width: 1023px) {
  .ssg-sticky-cta {
    position: fixed;
    inset-inline: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    gap: ${SPACE['2']};
    padding: ${SPACE['2']};
    padding-bottom: calc(${SPACE['2']} + env(safe-area-inset-bottom, 0px));
    background: var(--q-surface-container, #ffffff);
    border-top: 1px solid var(--q-outline-variant, rgb(0 0 0 / 12%));
  }

  .ssg-sticky-cta__action {
    display: inline-flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: ${SPACE['1']};
    min-height: 48px;
    border: 2px solid currentcolor;
    border-radius: 0.5rem;
    color: inherit;
    font-weight: 600;
    text-decoration: none;
  }

  .ssg-sticky-cta__action--primary {
    background: var(--q-primary, #1976d2);
    border-color: var(--q-primary, #1976d2);
    color: var(--q-on-primary, #ffffff);
  }
}

/* Respect the user's motion preference. */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
`
  }
]

/**
 * The shortcut names, safelisted.
 *
 * Vite splits the template's shared components into their own chunks
 * (`assets/SiteHeader-*.js`, …), and the consumer's UnoCSS content scan only
 * matches some of them — so classes that live in a split chunk are not always
 * extracted and their shortcuts never emit. The design system's class names are
 * not incidental markup, so they are safelisted instead of relying on the scan.
 */
export const ssgSafelist: string[] = ssgShortcuts.flatMap((shortcut) =>
  Array.isArray(shortcut) && typeof shortcut[0] === 'string'
    ? [shortcut[0]]
    : []
)

/** Convenience bundle for the app config. */
export const ssgUnoConfig = {
  theme: ssgTheme,
  shortcuts: ssgShortcuts,
  preflights: ssgPreflights,
  safelist: ssgSafelist
}
