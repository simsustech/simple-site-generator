<template>
  <q-page class="ssg-section">
    <article class="ssg-section__inner">
      <Breadcrumbs v-if="breadcrumbs?.length" :trail="breadcrumbs" />

      <!--
        The offer: heading, price, action — in that order, and before any prose.

        This is the whole template. The site it replaces ended every page in
        "vraag een offerte aan" and never named a number, so a visitor comparing
        two or three quotes had nothing to compare. The price goes first because
        that is the question; the prose below argues for the number rather than
        standing in for it.
      -->
      <section class="ssg-plain__offer">
        <!--
          The intro and the photograph, side by side from `lg`.

          The image is a real `<figure>`: a background image cannot be sized into
          a column without either letterboxing it or cropping the product out of
          the frame, and it carries no alt text. The `<img>` keeps its own aspect
          and scales with the column, so the same page works for a portrait
          photograph and for this 1156×721 one.
        -->
        <div class="ssg-plain__offer-cols">
          <div class="ssg-plain__intro">
            <p v-if="regionLabel" class="ssg-plain__region">
              <q-icon
                name="i-mdi-map-marker-outline"
                size="16px"
                aria-hidden="true"
              />
              {{ regionLabel }}
            </p>

            <!--
              The page owns the document's single <h1>. `PageContent` demotes the
              markdown headings so the body starts at `<h2>` and the outline stays
              valid.
            -->
            <h1 class="ssg-plain__title">{{ title }}</h1>
            <p v-if="description" class="ssg-plain__lede">{{ description }}</p>

            <p v-if="price" class="ssg-plain__price">
              <span v-if="price.from" class="ssg-plain__price-label">
                {{ price.from }}
              </span>
              <span
                v-if="price.amount"
                class="ssg-plain__price-value ssg-plain__tnum"
              >
                {{ price.amount }}
              </span>
              <!--
                An open place, not a placeholder number: `€ ..` in the muted unfilled
                style says the tariff has not been supplied yet, where `€ 0` or a
                sample amount would be read as a fact.
              -->
              <span v-else class="ssg-plain__price-value ssg-plain__tbd"
                >€ ..</span
              >
              <span v-if="price.unit" class="ssg-plain__price-unit">
                {{ price.unit }}
              </span>
            </p>
            <p v-if="price?.note" class="ssg-plain__price-note">
              {{ price.note }}
            </p>

            <div v-if="cta?.message" class="ssg-plain__actions">
              <CtaButton
                :label="cta.message"
                :route="cta.route"
                :href="cta.href"
                data-ssg="hero-cta"
              />
              <CtaButton
                v-if="cta.secondary?.message"
                variant="secondary"
                :label="cta.secondary.message"
                :route="cta.secondary.route"
                :href="cta.secondary.href"
                data-ssg="hero-cta-secondary"
              />
            </div>
          </div>

          <figure v-if="headerImage" class="ssg-plain__hero-media">
            <!--
              Decorative: the heading and the lede beside it already say what the
              photograph shows, so a screen reader gains nothing from a second
              telling of it.
            -->
            <img
              class="ssg-plain__hero-img"
              :src="headerImage"
              alt=""
              decoding="async"
              fetchpriority="high"
            />
          </figure>
        </div>

        <!--
          What the price includes, as a real `<table>` with a `<th scope="row">`
          per line. It is tabular data: a screen reader can walk it cell by cell
          and each row is named by its heading. The same facts as a run-on
          sentence cannot be reviewed with a thumb.
        -->
        <table v-if="price?.rows?.length" class="ssg-plain__table">
          <caption class="ssg-plain__table-caption">
            {{
              price.tableCaption ?? 'What is included'
            }}
          </caption>
          <tbody>
            <tr v-for="row in price.rows" :key="row.label">
              <th scope="row" class="ssg-plain__table-head">{{ row.label }}</th>
              <td class="ssg-plain__table-cell ssg-plain__tnum">
                {{ row.value }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!--
        The four steps, as an ordered list rather than four cards. The numbering
        is the information — this is a sequence — so `<ol>` carries it, and the
        visible number is `aria-hidden` to keep it from being read out twice.
      -->
      <section v-if="steps?.length" class="ssg-plain__steps">
        <header class="ssg-plain__section-head">
          <h2 class="ssg-plain__section-title">{{ stepsHeading }}</h2>
          <p v-if="stepsLede" class="ssg-plain__section-lede">
            {{ stepsLede }}
          </p>
        </header>
        <ol class="ssg-plain__steps-list">
          <li
            v-for="(step, index) in steps"
            :key="step.label"
            class="ssg-plain__step"
          >
            <!--
              `row-span-2`: the number occupies the left column for both rows, so
              the title and the text stack beside it. Without it the third child
              wraps into the 32px column and the text sets one word per line.
            -->
            <span class="ssg-plain__step-number row-span-2" aria-hidden="true">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <span class="ssg-plain__step-title">{{ step.label }}</span>
            <span v-if="step.text" class="ssg-plain__step-text">{{
              step.text
            }}</span>
          </li>
        </ol>
      </section>

      <PageContent
        :content="content"
        :lists="lists"
        :videos="videos"
        :images="images"
      />

      <slot />
    </article>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Breadcrumbs from '../shared/Breadcrumbs.vue'
import CtaButton from '../shared/CtaButton.vue'
import PageContent from '../shared/PageContent.vue'
import type { PageProps } from '../shared/types.js'

/**
 * Plain template page — one service, one action, one price.
 *
 * Composed over the same shared layer as `business`: the prose renderer, the
 * breadcrumb trail and the CTA button, so this template costs no extra
 * template costs no extra JavaScript beyond what the others ship.
 */
const props = defineProps<
  PageProps & {
    /** The tarief card. Absent means the page has no price to show yet. */
    price?: {
      /** The word before the amount, e.g. `Vanaf`. */
      from?: string
      /** The amount exactly as it should read, e.g. `€ 295`. */
      amount?: string
      /** The period the amount covers, e.g. `per week`. */
      unit?: string
      /** One line under the amount, e.g. what placement costs. */
      note?: string
      /** Heading above the included-items table. */
      tableCaption?: string
      /** What the price includes, one row each. */
      rows?: { label: string; value: string }[]
    }
    /** The four steps, in order. */
    steps?: { label: string; text?: string }[]
    /** Heading above the steps. */
    stepsHeading?: string
    /** One line under that heading. */
    stepsLede?: string
    /** The delivery area line above the heading, when the site names one. */
    region?: string
  }
>()

/**
 * The delivery area, as one line above the heading.
 *
 * It comes from the page's own frontmatter and falls back to the site's
 * `serviceArea` — a business that serves two countries states it once, and a page
 * that only covers one of them can say so. Rendered only when it is known: an
 * empty region line is a claim with no content behind it.
 */
const regionLabel = computed(() => {
  if (props.region) return props.region

  const areas = props.extra?.serviceArea

  return Array.isArray(areas) && areas.length > 0
    ? areas.join(' en ')
    : undefined
})

/** The heading above the steps, from the site's `extra` so it is typed once. */
const stepsHeading = computed(
  () =>
    props.stepsHeading ??
    (props.extra?.stepsHeading as string | undefined) ??
    'How it works'
)

const stepsLede = computed(
  () => props.stepsLede ?? (props.extra?.stepsLede as string | undefined)
)
</script>
