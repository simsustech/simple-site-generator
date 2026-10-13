<template>
  <figure v-if="steps.length >= 2" class="ssg-demo" data-ssg="hero-demo">
    <!--
      The graphic is a labelled process, not decoration. `role="img"` with a
      single accessible name means a screen reader announces one image and skips
      the labels inside it — which is correct, because the labels are the picture,
      not content the reader needs twice.

      The geometry is generated from the step count rather than hand-drawn, so
      changing `demo.steps` in frontmatter changes the picture. That is what
      keeps it from being the generic abstract shape the conversion research
      warns about: it draws *this* page's process, at whatever length that is.
    -->
    <svg
      class="ssg-demo__svg"
      viewBox="0 0 360 220"
      role="img"
      :aria-label="accessibleName"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern
          :id="dotsId"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <circle class="ssg-demo__grid-dot" cx="1" cy="1" r="1" />
        </pattern>
        <!--
          `pathLength="100"` normalises the route, so the travelling pulse is
          keyframed in percent-like units and needs no measurement at runtime.
          Without it a longer route would take longer to traverse and the loop
          would never line up.
        -->
        <path :id="routeId" :d="routePath" pathLength="100" />

        <!--
          The grid is faded out at the edges rather than clipped flat. A plain
          tiled rect ends in a hard line of dots that reads as a background
          texture that failed to tile; the fade makes the grid a ground the
          graphic sits on.

          A luminance mask (the SVG default), so white is opaque and the stop
          that goes to zero opacity is what softens the edge. The stops are
          placed so the grid is still visible behind the labels, which sit along
          the bottom of the box.
        -->
        <radialGradient :id="fadeId" cx="50%" cy="50%" r="72%">
          <stop offset="45%" stop-color="#fff" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
        <mask :id="maskId">
          <rect
            x="0"
            y="0"
            width="360"
            height="220"
            :fill="`url(#${fadeId})`"
          />
        </mask>
      </defs>

      <rect
        class="ssg-demo__grid"
        x="0"
        y="0"
        width="360"
        height="220"
        :fill="`url(#${dotsId})`"
        :mask="`url(#${maskId})`"
      />

      <!-- The route, then a bright segment travelling along it. -->
      <use class="ssg-demo__route" :href="`#${routeId}`" />
      <use class="ssg-demo__pulse" :href="`#${routeId}`" />

      <g
        v-for="(step, index) in steps"
        :key="step"
        class="ssg-demo__stop"
        :style="{ '--i': index }"
      >
        <circle
          class="ssg-demo__ring"
          :cx="points[index].x"
          :cy="points[index].y"
          r="9"
        />
        <circle
          class="ssg-demo__dot"
          :cx="points[index].x"
          :cy="points[index].y"
          r="3.5"
        />
        <text
          class="ssg-demo__label"
          :x="points[index].x"
          :y="points[index].y + 20"
          :text-anchor="anchorOf(index)"
        >
          {{ step }}
        </text>
      </g>
    </svg>
  </figure>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

/**
 * The hero graphic: a process drawn as a route with stops, animated CSS-only.
 *
 * Why a process and not an abstract shape: the conversion research this
 * template's content rules come from lists "abstract geometric shapes" as the
 * first generic-imagery anti-pattern — decoration that differentiates nothing.
 * A route with named stops depicts something true about the site, and the names
 * come from frontmatter, so the picture is specific to the page that declares it.
 *
 * Why CSS-only: motion in the critical render path is forbidden by the same
 * research. The animation here is three keyframe rules in `ssgPreflights`
 * (`stroke-dashoffset` travel plus a `transform: scale()` ping), so there is no
 * JavaScript, no layout shift, and it works in a prerendered page before any
 * bundle has loaded. Animating `opacity` was deliberately avoided — an earlier
 * reveal animation failed the accessibility gate for exactly that reason.
 *
 * The animation is decoration; the graphic is not. With `prefers-reduced-motion`
 * the existing blanket override in `ssgPreflights` collapses every animation to
 * a single near-zero-duration pass, leaving the route, the stops and the labels
 * fully legible.
 */
const props = defineProps<{
  /** Stop labels, drawn in order along the route. Two to five read best. */
  steps: string[]
  /** Accessible name for the whole graphic; falls back to the stop labels. */
  label?: string
}>()

// `useId` rather than a counter: two demos on one page would otherwise share an
// `<pattern>`/`<path>` id, and the second instance would resolve to the first
// one's geometry.
const uid = useId()
const dotsId = `ssg-demo-dots-${uid}`
const routeId = `ssg-demo-route-${uid}`
const fadeId = `ssg-demo-fade-${uid}`
const maskId = `ssg-demo-mask-${uid}`

/** The layout box the route and the labels are laid out inside. */
const BOX = { left: 34, right: 326, top: 52, bottom: 168 }

/**
 * Stops are spread evenly across the box on a rising line with a slight wave, so
 * the route has a direction (bottom-left to top-right reads as progress) without
 * being a ruler. The wave is one full period across the box, which keeps the ends
 * flat whatever the step count.
 */
const points = computed(() => {
  const count = props.steps.length
  const span = count - 1

  return props.steps.map((_, index) => {
    const t = span === 0 ? 0 : index / span
    const wave = Math.sin(t * Math.PI * 2) * 14

    return {
      x: BOX.left + (BOX.right - BOX.left) * t,
      y: BOX.bottom + (BOX.top - BOX.bottom) * t + wave
    }
  })
})

/**
 * A smooth curve through the stops, built from quadratic segments between each
 * stop's midpoint. This needs no control-point maths and, unlike a straight
 * polyline, does not read as a chart.
 */
const routePath = computed(() => {
  const pts = points.value

  if (pts.length < 2) return ''

  let d = `M ${round(pts[0].x)} ${round(pts[0].y)}`

  for (let i = 1; i < pts.length - 1; i += 1) {
    const control = pts[i]
    const next = pts[i + 1]
    const midX = (control.x + next.x) / 2
    const midY = (control.y + next.y) / 2

    d += ` Q ${round(control.x)} ${round(control.y)} ${round(midX)} ${round(midY)}`
  }

  const last = pts[pts.length - 1]

  return `${d} L ${round(last.x)} ${round(last.y)}`
})

/**
 * The first and last label sit at the edge of the box, so centring them would
 * push half the word outside the viewBox and clip it. Anchor them inward.
 */
function anchorOf(index: number): string {
  if (index === 0) return 'start'
  if (index === props.steps.length - 1) return 'end'
  return 'middle'
}

const accessibleName = computed(
  () => props.label ?? `Process: ${props.steps.join(', ')}`
)

/** Sub-pixel coordinates only add noise to the markup. */
function round(value: number): number {
  return Math.round(value * 100) / 100
}
</script>
