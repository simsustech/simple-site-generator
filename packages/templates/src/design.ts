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
 * `--q-elevation-level*`, `--q-card-radius`). The app sets one source colour
 * (`ssgSourceColor`, or its own hex) and the whole template re-themes —
 * including dark mode, because those tokens switch with `body--dark`.
 *
 * There is deliberately no second way in. An app used to pass a nine-entry
 * `colors` map as well (`primary`, `secondary`, `accent`, `text`, `dark`, …)
 * which the scaffold spread into the UnoCSS `theme`. Nothing here read it: it
 * only produced `bg-primary`-style utilities beside the role tokens, so a site
 * could carry two palettes that disagreed, and moving the band in `design.ts`
 * left the utilities behind on the old colours.
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

/**
 * The text measure, in one place.
 *
 * The prose column is a *container*, not a measure: running text is capped at
 * this so a paragraph stays readable, but a figure is not. Holding the whole
 * column to the measure is what shrank every 1200px illustration on the
 * simsustech site to about 40% of its authored size, and it is not what a measure
 * is for.
 */
const MEASURE = '68ch'

/**
 * The default source colour: the only colour input.
 *
 * `unocss-preset-quasar` derives every MD3 role token — and therefore every
 * colour in every template — from this one value, in both light and dark mode.
 * It is exported so a scaffolded site and this package cannot drift apart: the
 * value here is the value `ssg init` writes into the new site's
 * `vitrify.config.ts`.
 */
export const ssgSourceColor = '#22c92a'

export const ssgTheme: Theme = {
  fontSize: Object.fromEntries(
    Object.entries(STEP).map(([key, value]) => [`step-${key}`, value])
  ),
  spacing: Object.fromEntries(
    Object.entries(SPACE).map(([key, value]) => [`space-${key}`, value])
  ),
  borderRadius: { DEFAULT: '0.5rem' },
  maxWidth: { measure: MEASURE, content: '1120px' }
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
  // No `max-w-measure` here: the prose block is the *container*. Running text is
  // capped at the measure by the preflight below, so a figure can use the width
  // the column actually has.
  ['ssg-prose', 'text-step-0 leading-[1.65]'],
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
  // Chrome the plain template asks for: how to reach the business, and the way
  // into its own client environment. Both are guarded by `v-if` in the header,
  // so a site that sets neither renders neither — see `SiteHeader`.
  [
    'ssg-header__phone',
    `inline-flex items-center min-h-[24px] text-[14px] font-600 whitespace-nowrap text-[${ON_CHROME}] underline-offset-4 hover:underline`
  ],
  [
    'ssg-header__login',
    // A bordered button, not a filled one: the login leaves the site, and it is
    // not the page's primary action — the CTA inside the page is.
    `inline-flex items-center gap-[6px] min-h-[36px] px-[12px] rounded-[${CARD_RADIUS}] b b-solid b-[${OUTLINE_VARIANT}] text-[${ON_CHROME}] text-[14px] font-600 no-underline whitespace-nowrap hover:opacity-80`
  ],

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

  // Principles — the numbered, ruled band of the rules the work follows.
  //
  // Ruled rather than tinted: the tiles already sit on the page surface, and a
  // second tinted panel under the header band and the bento would read as three
  // competing slabs. The number is decoration (`aria-hidden`); it is an `<ol>`,
  // so the order is announced by the list itself.
  ['ssg-principles', 'mt-space-5'],
  ['ssg-principles__header', 'max-w-measure mb-space-4'],
  [
    'ssg-principles__heading',
    `text-[${ON_SURFACE}] text-step-3 leading-[1.15] m-0`
  ],
  [
    'ssg-principles__leading',
    `text-[${ON_SURFACE_VARIANT}] text-step-1 mt-space-2 mb-0`
  ],
  [
    'ssg-principles__list',
    // Same reflow rule as the bento grid: `auto-fit` instead of a breakpoint, so
    // four items are four columns when there is room and one column when there is
    // not, with no intermediate step to get wrong.
    'grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-space-4 m-0 p-0 [list-style:none]'
  ],
  [
    'ssg-principles__item',
    `relative p-space-4 rounded-[${CARD_RADIUS}] bg-[${SURFACE_LOWEST}] b b-solid b-[${OUTLINE_VARIANT}] shadow-[${ELEVATION_1}]`
  ],
  [
    'ssg-principles__mark',
    `inline-flex items-center justify-center min-w-[2rem] h-[2rem] rounded-[${CARD_RADIUS}] bg-[${SECONDARY_CONTAINER}] text-[${ON_SECONDARY_CONTAINER}] font-700`
  ],
  ['ssg-principles__title', `text-[${ON_SURFACE}] text-step-1 mt-space-3 mb-0`],
  [
    'ssg-principles__text',
    `text-[${ON_SURFACE_VARIANT}] text-step-0 mt-space-2 mb-0 leading-[1.6]`
  ],
  [
    'ssg-principles__note',
    `text-[${ON_SURFACE_VARIANT}] text-step--1 mt-space-4 max-w-measure`
  ],
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
  ],
  [
    'ssg-business__band-copy',
    // The graphic is `hidden` below `lg`, so the copy only has to make room for
    // it there — see the modifier below.
    'relative'
  ],
  ['ssg-business__band-copy--narrow', 'lg:max-w-[58%]'],
  [
    'ssg-business__band-demo',
    // Absolute in the band, which is already `relative overflow-hidden`. Below
    // `lg` the band has no room for a graphic beside the copy, so it is hidden
    // rather than shrunk — the labels are the point and they stop being legible
    // first. `pointer-events-none` keeps it from swallowing the copy's links.
    //
    // `hidden` here only wins because `ssg-demo` does not also set a display
    // value; see the note on that shortcut. Two equal-specificity classes each
    // setting `display` would be resolved by stylesheet order, and this one lost
    // — the graphic rendered on top of the headline on every phone.
    'hidden lg:block pointer-events-none absolute top-space-3 right-space-3 w-[40%] max-w-[22rem]'
  ],

  // Plain — the sober template: one service, one action, a price on the screen
  // before anything else. The look came from a hand-written mockup stylesheet
  // (`nuchter.css`); this is that stylesheet's layout and rhythm, expressed as
  // shortcuts, because no `.vue` file in this package carries a `<style>` block
  // and `ssg verify` refuses a class the built CSS does not define.
  //
  // What came over: the 8px spacing rhythm, the type scale (the shared `STEP`
  // scale, with one literal for the section heading, which sits between two
  // steps), the paper-to-line neutrals, the price card, the step list, the form
  // and the tariff table. What did not: the mockup's colours. Every one of them
  // is an MD3 role token here, so the whole template follows `sourceColor` and
  // flips with `body--dark` without a rule of its own.
  //
  // The rhythm is written in pixels (`py-[24px]`, `gap-[16px]`) rather than the
  // shared `SPACE` scale: the mockup is strictly 8-point (8/16/24/32/48/64/96)
  // and `SPACE` is a fluid five-step scale built for the other templates. Adding
  // steps to it would resize every existing site to fit one template.
  // The offer block: heading, price, action, and the included-items table. One
  // panel, so the whole argument of the page sits above the prose.
  ['ssg-plain__offer', 'mb-[48px]'],
  //
  // The hero is two columns from `lg`: the argument on the left, the photograph
  // on the right as a card. The card is a real `<figure>`/`<img>`, not a
  // background: a background cannot be sized into a column without letterboxing
  // or cropping whatever the page happens to declare, and it carries no alt.
  [
    'ssg-plain__offer-cols',
    'grid gap-[48px] items-start lg:grid-cols-[minmax(0,1fr)_minmax(0,0.86fr)]'
  ],
  ['ssg-plain__intro', 'relative min-w-0'],
  [
    'ssg-plain__hero-media',
    // `order-first`: the mockup opens the mobile page with the photograph and
    // puts the heading under it, while the DOM keeps the text first so a screen
    // reader — and the document outline — still gets the heading before the
    // picture. From `lg` the two-column grid takes over and the media returns to
    // its DOM position on the right.
    `m-0 order-first overflow-hidden rounded-[${CARD_RADIUS}] bg-[${SURFACE_CONTAINER}] lg:order-none`
  ],
  ['ssg-plain__hero-img', 'block w-full h-auto'],
  [
    'ssg-plain__region',
    `inline-flex items-center gap-[8px] text-[13.5px] text-[${ON_SURFACE_VARIANT}] m-0 mb-[16px]`
  ],
  [
    // The hero heading: the scale's own top step, which is the 2.75rem the
    // mockup measured, tracked in so a long Dutch compound word breaks where it
    // should rather than at the container edge.
    'ssg-plain__title',
    `text-[${ON_SURFACE}] text-step-3 leading-[1.08] tracking-[-.03em] font-700 m-0 mb-[16px]`
  ],
  [
    'ssg-plain__lede',
    `text-[${ON_SURFACE_VARIANT}] text-[18px] leading-[1.55] m-0 mb-[32px] [max-width:40ch]`
  ],
  [
    'ssg-plain__section-head',
    // The measure sits on the heading block, not on the section: capping the
    // container is what shrank every illustration in `ssg-prose`.
    `[max-width:66ch] mb-[48px]`
  ],
  [
    'ssg-plain__section-title',
    // The one literal size in the template: 1.72rem sits between `step-1` and
    // `step-2`, and the mockup's measured values are what the headings were
    // designed against. Written once, here.
    `text-[${ON_SURFACE}] text-[clamp(1.38rem,2.15vw,1.72rem)] leading-[1.18] tracking-[-.024em] font-700 m-0 mb-[16px]`
  ],
  ['ssg-plain__section-lede', `text-[${ON_SURFACE_VARIANT}] text-[17px] m-0`],

  // The price card: a ruled band under the lede, label left and amount right.
  // It is the first thing after the heading on purpose — the whole template
  // exists because the site it replaces never named a price.
  [
    'ssg-plain__price',
    // `b-t`/`b-b` set a width; the style has to be named per side. A bare
    // `b-solid` styles all four sides, and the two that carry no width then
    // paint at the CSS initial `medium` — 3px, which turns the band into a box.
    `flex items-baseline gap-[10px] py-[24px] b-t b-b b-t-solid b-b-solid b-[${OUTLINE_VARIANT}]`
  ],
  [
    'ssg-plain__price-label',
    `text-[14px] text-[${ON_SURFACE_VARIANT}] flex-[0_0_auto]`
  ],
  [
    'ssg-plain__price-value',
    `text-[${ON_SURFACE}] text-[31px] font-700 tracking-[-.025em] leading-none`
  ],
  [
    'ssg-plain__price-unit',
    `text-[14px] font-400 text-[${ON_SURFACE_VARIANT}] tracking-normal ml-[6px]`
  ],
  [
    'ssg-plain__price-note',
    `mt-[16px] mb-0 text-[14px] text-[${ON_SURFACE_VARIANT}]`
  ],

  // The action. The button itself is the shared `CtaButton` (it owns its own
  // styling and its link/route duality); this is only the row it sits in, so two
  // actions would line up instead of stacking.
  ['ssg-plain__actions', 'flex gap-[10px] flex-wrap mt-[32px]'],

  // The four steps, as a ruled list. The number is decoration beside the title
  // and is `aria-hidden` in the markup; it is an `<ol>`, so the order is
  // announced by the list itself.
  ['ssg-plain__steps', 'mt-[48px]'],
  ['ssg-plain__steps-list', '[list-style:none] m-0 p-0'],
  // The list and the drawing side by side, as the mockup had them. The drawing
  // is decoration and the list is the content, so the list keeps the wider
  // column and the pair stacks below `lg`.
  [
    'ssg-plain__steps-grid',
    'grid gap-[32px] items-start lg:grid-cols-[1.1fr_.9fr]'
  ],
  [
    'ssg-plain__step',
    `grid grid-cols-[32px_1fr] gap-x-[16px] gap-y-[4px] py-[24px] b-t b-t-solid b-[${OUTLINE_VARIANT}]`
  ],
  [
    'ssg-plain__step-number',
    `text-[13px] font-600 text-[${PRIMARY}] leading-[1.9]`
  ],
  [
    'ssg-plain__step-title',
    'block text-[16.5px] font-600 tracking-[-.01em] mb-[3px]'
  ],
  [
    'ssg-plain__step-text',
    `block text-[${ON_SURFACE_VARIANT}] text-[15.5px] leading-[1.5]`
  ],

  // The quote form. Each field carries its own classes rather than relying on a
  // descendant selector, so every class in the markup is a class in the
  // stylesheet — which is what `ssg verify` checks.
  ['ssg-plain__field', 'mb-[24px]'],
  ['ssg-plain__label', 'block text-[14.5px] font-500 mb-[7px]'],
  [
    'ssg-plain__hint',
    `font-400 text-[${ON_SURFACE_VARIANT}] text-[13.5px] ml-[6px]`
  ],
  [
    'ssg-plain__input',
    `w-full text-[16px] text-[${ON_SURFACE}] bg-[${SURFACE_LOWEST}] b b-solid b-[${OUTLINE_VARIANT}] rounded-[6px] px-[12px] py-[11px] min-h-[46px] placeholder:text-[${ON_SURFACE_VARIANT}] focus-visible:b-[${PRIMARY}]`
  ],
  [
    'ssg-plain__check',
    `grid grid-cols-[18px_1fr] gap-[10px] items-start mb-[24px] text-[14.5px] text-[${ON_SURFACE_VARIANT}] leading-[1.5]`
  ],
  ['ssg-plain__status', 'mt-[16px] mb-0 text-[14.5px] leading-[1.5]'],
  ['ssg-plain__status--ok', `text-[${PRIMARY}]`],
  [
    'ssg-plain__status--error',
    // `error` is an MD3 role; `negative` is Quasar's own semantic slot. Either
    // is correct in both themes, and the fallback keeps the message readable if
    // a preset version publishes only one of them.
    'text-[var(--q-error,var(--q-negative))]'
  ],
  // A two-column row: label left, amount right. Separate from `ssg-plain__step`
  // because that one reserves a numbered first column, and a summary row has
  // nothing to put in it.
  [
    'ssg-plain__sum-row',
    `grid grid-cols-[1fr_auto] gap-x-[16px] items-baseline py-[8px] text-[15px] b-t b-t-solid b-[${OUTLINE_VARIANT}]`
  ],

  // The calculator: an input panel and a result panel, side by side once there is
  // room for both. The rule between them belongs to whichever panel is on top,
  // which is why the output panel carries a top border below `lg` and a start
  // border above it.
  [
    'ssg-plain__calc',
    `grid border border-solid border-[${OUTLINE_VARIANT}] rounded-[${CARD_RADIUS}] overflow-hidden lg:grid-cols-[minmax(0,1fr)_24rem]`
  ],
  ['ssg-plain__calc-in', 'p-[32px]'],
  [
    'ssg-plain__calc-out',
    `p-[32px] bg-[${SURFACE_CONTAINER}] border-t border-t-solid lg:border-t-0 lg:border-s lg:border-s-solid border-[${OUTLINE_VARIANT}]`
  ],
  // `accent-color` is the one property that styles a range input's track and
  // thumb together; the pseudo-elements behind it differ per browser.
  [
    'ssg-plain__range',
    `w-full h-[24px] [accent-color:${PRIMARY}] cursor-pointer`
  ],

  // The tariff table.
  ['ssg-plain__table', 'w-full [border-collapse:collapse] text-[16px]'],
  [
    'ssg-plain__table-caption',
    // The table's own name, read as a heading rather than as a footnote: the
    // mockup labels the band before the rows, and a 14px muted line sitting
    // directly under the action button read as its sub-label.
    `text-left text-[17px] font-600 text-[${ON_SURFACE}] pt-[40px] pb-[16px]`
  ],
  [
    'ssg-plain__table-head',
    `text-left text-[14.5px] font-500 text-[${ON_SURFACE_VARIANT}] w-[34%] pr-[24px] py-[14px] b-b b-b-solid b-[${OUTLINE_VARIANT}] align-top leading-[1.45]`
  ],
  [
    'ssg-plain__table-cell',
    `text-left text-[${ON_SURFACE}] py-[14px] b-b b-b-solid b-[${OUTLINE_VARIANT}] align-top leading-[1.45]`
  ],

  // A value the owner has not delivered yet reads as unfilled — muted and
  // tracked out — so an open place can never be mistaken for a fact. `tnum`
  // keeps a column of prices and distances aligned.
  ['ssg-plain__tbd', `text-[${ON_SURFACE_VARIANT}] tracking-[.06em]`],
  ['ssg-plain__tnum', '[font-variant-numeric:tabular-nums]'],

  // Hero demo — the animated process graphic (`shared/HeroDemo.vue`). Layout
  // only: an SVG's paint properties and keyframes are not expressible as
  // utilities, so they live in the preflight below.
  //
  // No `display` value here, deliberately. A `<figure>` is block by default, so
  // `block` would be redundant — and harmful: this class is always applied
  // alongside a variant (`ssg-business__band-demo`), and two single-class
  // selectors that both set `display` are resolved by stylesheet order rather
  // than by intent. That is how the graphic ended up painted over the headline on
  // mobile, where the band variant asks for `hidden`.
  ['ssg-demo', 'm-0 w-full'],
  ['ssg-demo__svg', 'block w-full h-auto']
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

/* The plain template's buttons carry the same corner as its photo card.

   MD3's default button is a full pill, and next to a 6px card that reads as a
   second, unrelated shape language. Scoped to this template's action row so the
   other templates keep the pill their own mockups asked for.

   Quasar paints the button's own background and outline on a pseudo-element, so
   the corner has to be set there as well as on the button: setting only the
   element leaves the visible shape a pill. */
.ssg-plain__actions .ssg-cta,
.ssg-plain__actions .ssg-cta::before {
  border-radius: var(--q-card-radius);
}

/* The quiet action is a second button, not a second link. Quasar's outline
   variant borrows the primary colour for text and border, which on this page
   reads as an inline link beside the filled button; the mockup gives it ink
   text and a hairline outline instead. */
.ssg-plain__actions .ssg-cta.q-btn--outline {
  color: var(--q-on-surface);
}

.ssg-plain__actions .ssg-cta.q-btn--outline::before {
  border-color: var(--q-outline-variant);
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

/*
  A link in a table cell is not prose, so it inherited nothing but the user
  agent's own link colour, which is 7.5:1 on white and 1.8:1 on the dark
  dark surface. The light-mode contrast audit passed it and dark mode did not.
  Tables are how the plain template shows contact details, so this is the one
  place an unstyled anchor was guaranteed to appear.
*/
.ssg-plain__table :where(a) {
  color: var(--q-primary, currentColor);
  text-underline-offset: 0.16em;
  transition: opacity 0.2s;
}

.ssg-plain__table :where(a):hover {
  opacity: 0.8;
}

/*
  Running text is capped at the measure; the column is not.

  A measure is a readability constraint on prose, and applying it to the whole
  block also constrained every illustration to it: the site's SVGs are authored at
  1200px and were being drawn at about 40% of that, which is what "too small"
  meant. Direct children only, so a list nested in a list is not re-capped.
*/
.ssg-prose {
  --ssg-measure: ${MEASURE};
}

.ssg-prose > :where(p, ul, ol, dl, blockquote, h1, h2, h3, h4, h5, h6) {
  max-width: var(--ssg-measure);
}

/*
  A paragraph that holds nothing but an image is a figure, not running text.

  Markdown wraps a standalone image in a paragraph tag, so capping paragraphs at
  the measure caps every illustration with it — the image is 100% of its
  block, and its containing block was the paragraph. This is the other half of
  the fix: without it the widened column changes nothing, which is exactly what
  the first attempt measured (illustration 680px, paragraph 680px).

  The :has() selector degrades safely: where it is unsupported the rule is
  dropped and the image is capped at the measure, which is the old behaviour
  rather than a break.
*/
.ssg-prose > p:has(> img:only-child) {
  max-width: none;
}

/*
  Markdown images: rounded, and never stretched beyond their own size.

  Markdown images: rounded, and never stretched beyond their own size.

  Width is auto rather than 100% — a percentage upscales a small image to fill
  the column, which is how a 240px diagram ends up blurry across 1100px. With
  auto the file renders at its intrinsic size, and an SVG with a viewBox and no
  explicit size reports the viewBox dimensions. Max-width is then the only cap.
*/
.ssg-prose :where(img) {
  display: block;
  width: auto;
  max-width: 100%;
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

/*
  The hero demo: a process drawn as a route with stops, animated CSS-only.

  Paint on SVG elements is not expressible as a utility, and the keyframes have
  nowhere else to live — there is no stylesheet — so both belong here.

  Everything that moves is transform or geometry, never opacity. That is not
  stylistic: an opacity animation on content failed the contrast gate once
  already (see the reveal note above), and a low-vision reader who never scrolls
  to the element keeps it permanently dimmed. The moving parts here are
  decoration inside an element that carries its own accessible name, so the
  contrast argument does not apply — but geometry is also the cheaper property,
  and the no-opacity rule is worth keeping unconditional.

  The reduced-motion preference needs no selector of its own: the blanket
  override below collapses duration and iteration count, which is enough to stop
  a keyframe animation. It would not be enough for a scroll-driven timeline,
  which is why that one is listed explicitly.
  below collapses duration and iteration count, which is enough to stop a
  keyframe animation. It would not be enough for a scroll-driven timeline, which
  is why that one is listed explicitly.
*/
.ssg-demo__grid-dot {
  fill: var(--q-outline-variant, currentColor);
}

.ssg-demo__route {
  fill: none;
  stroke: var(--q-outline-variant, currentColor);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ssg-demo__pulse {
  fill: none;
  stroke: var(--q-primary, currentColor);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 14 100;
  animation: ssg-demo-travel 3.6s linear infinite;
}

.ssg-demo__ring {
  fill: none;
  stroke: var(--q-primary, currentColor);
  stroke-width: 1.5;
  /* A scaled SVG child scales from the viewBox origin by default, which sends
     the ring flying toward the corner. The fill-box value pins the origin to
     element's own box, so it grows in place. */
  transform-box: fill-box;
  transform-origin: center;
  animation: ssg-demo-ping 3.6s ease-out infinite;
  animation-delay: calc(var(--i) * 0.45s);
}

.ssg-demo__dot {
  fill: var(--q-primary, currentColor);
}

.ssg-demo__label {
  fill: var(--q-on-surface-variant, currentColor);
  font-size: 11px;
  font-weight: 590;
  letter-spacing: -0.01em;
}

@keyframes ssg-demo-travel {
  from {
    stroke-dashoffset: 0;
  }

  to {
    /* The period of the stroke-dasharray above, so exactly one dash crosses the
       route per loop and the restart is invisible. The route also carries a
       pathLength of 100, so this is percent-like rather than a pixel length
       that would have to be measured. */
    stroke-dashoffset: -114;
  }
}

@keyframes ssg-demo-ping {
  0%,
  55%,
  100% {
    transform: scale(1);
  }

  28% {
    transform: scale(1.8);
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

/**
 * Candidates that must never become CSS.
 *
 * UnoCSS reads a candidate out of markup, not only out of class attributes: the
 * string `h1` is extracted from `<h1>` exactly as it is from `class="h1"`.
 * `presetUno` answers it, because the bare `hN` form is a height shorthand
 * (`h1` means `height: .25rem`) — so every site rendering an `<h1>` was shipping
 * `.h1 { height: .25rem }` into its stylesheet.
 *
 * The byte cost is trivial; the collision is not. `h1` is a plausible *class*
 * name — a CMS, a copy-pasted block, or a design system that names its heading
 * levels that way will eventually use it — and the element would silently
 * collapse to 4px tall with nothing in the source to explain why.
 *
 * `h-1` (with the dash) still works and is the real spelling, so this loses
 * nothing. `h` on its own is not a height utility, so it can only ever be noise.
 */
const ssgBlocklist: (string | RegExp)[] = [/^h[1-6]$/]

/** Convenience bundle for the app config. */
export const ssgUnoConfig = {
  theme: ssgTheme,
  shortcuts: ssgShortcuts,
  preflights: ssgPreflights,
  safelist: ssgSafelist,
  blocklist: ssgBlocklist
}
