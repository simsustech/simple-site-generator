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

/**
 * MD3 role tokens published by `unocss-preset-quasar`.
 *
 * `primary` is an *accent*: it fills components whose size is a button or an
 * icon, and MD3 gives it tone 80 in dark mode — bright by design, so it reads on
 * a dark surface. Painting a full-width bar with it is the mistake that put a
 * luminous green slab across the top of this site in dark mode. Layout surfaces
 * use the surface and container families, which are toned for the job and move
 * in the right direction in both modes.
 */
const PRIMARY = 'var(--q-primary)'
const ON_SURFACE = 'var(--q-on-surface)'
const ON_SURFACE_VARIANT = 'var(--q-on-surface-variant)'
const SURFACE_LOW = 'var(--q-surface-container-low)'
const SURFACE_LOWEST = 'var(--q-surface-container-lowest)'
const SURFACE_CONTAINER = 'var(--q-surface-container)'
const SURFACE_CONTAINER_HIGH = 'var(--q-surface-container-high)'
const SECONDARY_CONTAINER = 'var(--q-secondary-container)'
const ON_SECONDARY_CONTAINER = 'var(--q-on-secondary-container)'
const OUTLINE_VARIANT = 'var(--q-outline-variant)'

/**
 * Chrome: a light tint of the brand colour itself.
 *
 * `secondary-container` is the tonal container of the same hue as `primary`
 * (#d6e8cd light, #3c4b37 dark), which is what "a lighter version of the brand"
 * should mean — the alternative, `primary-container`, is #75ff68, brighter than
 * the accent it derives from and too loud for a bar that spans every page. The
 * accent itself stays where it belongs: buttons, links, icons and the rule on the
 * title band.
 */
const CHROME = SECONDARY_CONTAINER
const ON_CHROME = ON_SECONDARY_CONTAINER

/**
 * The title band, and the mask that fades its illustration out behind the text.
 *
 * Named once because the two must be the same colour: the mask is a gradient in
 * the band's own tone, and when they drift apart the illustration sits under a
 * wash of the wrong colour — which is exactly what happened when the band moved
 * off the brand tint while the mask stayed on it.
 */
const BAND = SURFACE_CONTAINER_HIGH
const ON_BAND = ON_SURFACE
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

  // Header — the chrome, on the surface role. The brand colour is carried by
  // the title band below it, the logo, and every accent inside it, instead of
  // by a full-width fill of the accent colour.
  ['ssg-header', `bg-[${CHROME}] text-[${ON_CHROME}]`],
  ['ssg-header__inner', 'w-full max-w-content mx-auto px-space-3'],
  ['ssg-header__toolbar', 'gap-space-2'],
  [
    'ssg-header__brand',
    `inline-flex items-center gap-space-2 no-underline text-[${ON_CHROME}] font-700 text-step-1`
  ],
  ['ssg-header__logo', 'block w-40px h-40px'],
  ['ssg-header__brand-name', 'whitespace-nowrap'],
  ['ssg-header__nav', 'hidden items-center gap-space-1 lg:flex'],

  // Shell
  ['ssg-shell__drawer-link', 'block w-full text-inherit no-underline'],

  // Footer — a tonal container, so the page is bookended in the brand colour
  // without a full fill of the accent role.
  [
    'ssg-footer',
    `px-space-3 pt-space-4 pb-space-3 bg-[${SECONDARY_CONTAINER}] text-[${ON_SECONDARY_CONTAINER}]`
  ],
  [
    'ssg-footer__inner',
    'flex flex-wrap gap-space-4 w-full max-w-content mx-auto'
  ],
  ['ssg-footer__nav', 'flex-[1_1_12rem] min-w-0'],
  ['ssg-footer__contact', 'flex-[1_1_12rem] min-w-0'],
  ['ssg-footer__social', 'flex-[1_1_12rem] min-w-0'],
  [
    'ssg-footer__heading',
    `text-[${ON_SECONDARY_CONTAINER}] text-step-0 m-0 mb-space-1`
  ],
  [
    'ssg-footer__list',
    '[list-style-type:none] m-0 p-0 flex flex-col gap-space-1 text-step--1'
  ],
  ['ssg-footer__list--inline', 'flex-row gap-space-3'],
  [
    'ssg-footer__link',
    // `min-h-[24px]` is the WCAG 2.2 target-size minimum (2.5.8). A footer
    // link is small text in a tight list, so without it two adjacent targets
    // sit inside each other's 24px circle and the audit fails the page.
    `inline-flex items-center min-h-[24px] text-[${ON_SECONDARY_CONTAINER}] underline transition-opacity duration-200 hover:opacity-80`
  ],
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
    `p-space-4 rounded-[${CARD_RADIUS}] bg-[${SURFACE_LOWEST}] b b-solid b-[${OUTLINE_VARIANT}] shadow-[${ELEVATION_1}] transition-[box-shadow,transform] duration-200 hover:shadow-[${ELEVATION_2}] hover:-translate-y-0.5`
  ],
  ['ssg-bento__icon', `text-[${PRIMARY}] text-step-3`],
  [
    'ssg-bento__tile-header',
    `text-[${ON_SURFACE}] text-step-1 mt-space-2 mb-space-1`
  ],
  ['ssg-bento__tile-content', `text-[${ON_SURFACE_VARIANT}] m-0 leading-[1.6]`],
  [
    'ssg-bento__link',
    `text-[${PRIMARY}] inline-block mt-space-2 font-600 transition-opacity duration-200 hover:opacity-80`
  ],

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
  [
    'ssg-proof-section__link',
    `text-[${PRIMARY}] transition-opacity duration-200 hover:opacity-80`
  ],

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
  [
    'ssg-breadcrumbs__link',
    `text-[${PRIMARY}] transition-opacity duration-200 hover:opacity-80`
  ],

  // CTA

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
/* The title band: a neutral panel with the brand rule down its side. It used to
   carry the brand tint itself, but the header and footer now do — a band in the
   same tone as the header above it would read as one block. */
function pageHeader(): string {
  return `relative overflow-hidden bg-[${BAND}] text-[${ON_BAND}] p-space-4 rounded-[${CARD_RADIUS}] b-s-4 b-s-solid b-s-[${PRIMARY}] mb-space-5`
}

/**
 * Inline style for the header band's background illustration.
 *
 * The geometry lives here instead of in the shortcut above because the preset
 * defines neither `bg-no-repeat` nor `bg-right`: an unmatched utility is dropped
 * silently, which is how the illustration ended up tiling across the whole band.
 * Background properties are also the part UnoCSS cannot express for a per-page
 * image URL, so they belong in the style binding either way.
 */
export function headerImageStyle(
  headerImage?: string
): Record<string, string> | undefined {
  if (!headerImage) return undefined

  return {
    // A gradient in the band's own colour over the illustration: the band's text
    // sits on the band, and the illustration only reaches it as its own tint, so
    // a long lede cannot end up reading across the dots.
    backgroundImage: `linear-gradient(to right, ${BAND} 40%, transparent 75%), url('${headerImage}')`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right center, right center',
    backgroundSize: '45% auto, 45% auto'
  }
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
 *
 * Each `getCSS` returns a template literal: a backtick anywhere inside one — in
 * prose as much as in CSS — closes it early and breaks the build with a syntax
 * error pointing at the comment rather than the cause.
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

/* The header is chrome: a brand tint, with its paired on-colour. A utility cannot
   set the background — Quasar's own q-header rule wins the cascade for the
   element — so it is set here.

   The body element in the selector keeps it above that rule without needing
   !important, which also settles the text colour in dark mode, where Quasar
   paints the marginal sections with --q-on-surface. */
body .q-header.ssg-header,
body .ssg-header.q-header {
  background: var(--q-secondary-container, #d6e8cd);
  color: var(--q-on-secondary-container, #111f0f);
}

.ssg-header .q-btn,
/* The split dropdown's arrow is a 28px pill with its own divider while the
   label is a square flat button; side by side that reads as a stray
   half-circle. Give the arrow the same shape as its label. */
.ssg-header .q-btn-dropdown__arrow-container {
  border-radius: 0;
  border-left: 0;
}

/* One hover affordance for links, on any background: dim, don't recolour —
   a colour that works on the green footer does not work on the light page. */
.ssg-prose :where(a) {
  transition: opacity 0.2s;
}

.ssg-prose :where(a):hover {
  opacity: 0.8;
}
.ssg-header .q-btn-dropdown,
.ssg-header .q-icon {
  color: inherit;
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
  /* Lifted off the baseline a touch: an underline sitting on the descenders of
     a 17px body face reads as a strikethrough. The value is carried over from
     the ported QMarkdown stylesheet, which the templates no longer emit. */
  text-underline-offset: 0.16em;
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

/* Motion.

   Two CSS-only touches: nothing on the critical path, no JavaScript, and no
   layout shift.

   - A scroll-driven reveal for the discrete blocks below the title band. Its
     progress comes from the element's position, via the view() timeline, rather
     than the clock, so a block already in view sits at its end state: no flash
     of invisible content, no layout shift, and a browser without the feature
     just shows the block.

     It moves, it does not fade. Animating opacity was the first attempt and it
     failed the accessibility gate: an element at 0.4 opacity has roughly 0.4 of
     its contrast, so every tile below the fold was reported as unreadable — for
     a low-vision reader, permanently so on any element they never scroll to.
   - Cross-document view transitions, so a static site cross-fades between pages
     instead of flashing white. Ignored where unsupported.

   The title band is deliberately left out: its illustration is the largest paint
   on the page and the LCP element. */
@view-transition {
  navigation: auto;
}

@supports (animation-timeline: view()) {
  .ssg-bento__tile,
  .ssg-proof-section,
  .ssg-faq__item,
  .ssg-content__media {
    animation: ssg-reveal linear both;
  }
}

@keyframes ssg-reveal {
  from {
    transform: translateY(0.75rem);
  }
  to {
    transform: none;
  }
}

/*
  The timeline needs its own rule, and it has to come after the keyframes:

  - in the same rule the minifier folds these longhands into the shorthand,
    producing an animation shorthand with view() in it, which this Chromium
    parses as invalid and drops wholesale — the reveal then does nothing;
  - the selector has to match the rule above exactly, because a :where() here
    would have no specificity against it and the timeline would stay auto.
*/
@supports (animation-timeline: view()) {
  .ssg-bento__tile,
  .ssg-proof-section,
  .ssg-faq__item,
  .ssg-content__media {
    animation-timeline: view();
    animation-range: entry 0% cover 30%;
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

  /* A scroll-driven animation has no duration to shorten — its progress is the
     scroll position — so it has to lose its timeline instead. The hover lift is
     a transform the blanket rule above cannot reach either. */
  .ssg-bento__tile,
  .ssg-proof-section,
  .ssg-faq__item,
  .ssg-content__media {
    animation: none !important;
  }

  .ssg-bento__tile:hover {
    transform: none !important;
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
