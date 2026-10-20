<template>
  <q-page class="ssg-section">
    <article class="ssg-section__inner">
      <Breadcrumbs v-if="breadcrumbs?.length" :trail="breadcrumbs" />

      <header class="ssg-business__header" :style="bandStyle">
        <!--
          The band's decoration is either the animated process graphic or a
          background illustration, never both: they want the same right-hand
          third of the band, and the illustration would show through the demo's
          dot grid. A declared `demo` wins.
        -->
        <HeroDemo
          v-if="demoSteps.length"
          class="ssg-business__band-demo"
          :steps="demoSteps"
          :label="demo?.label ?? title"
        />

        <div
          class="ssg-business__band-copy"
          :class="{ 'ssg-business__band-copy--narrow': demoSteps.length > 0 }"
        >
          <!--
            The page owns the document's single <h1>. `PageContent` demotes markdown
            headings so the body starts at `<h2>` and the outline stays valid.
          -->
          <h1 class="ssg-business__title">{{ title }}</h1>
          <p v-if="description" class="ssg-business__lede">{{ description }}</p>
          <!--
            The page's one primary action, above the fold. Research on conversion
            is consistent that a hero converts on a single obvious next step; the
            CTA lives here rather than buried in the prose.
          -->
          <CtaButton
            v-if="cta?.message"
            class="ssg-page-header__cta"
            :label="cta.message"
            :route="cta.route"
            :href="cta.href"
            data-ssg="hero-cta"
          />
        </div>
      </header>

      <PageContent
        :content="content"
        :lists="lists"
        :videos="videos"
        :images="images"
      />

      <!--
        The principles band sits between the prose and the service cards: it is a
        statement of position, so it belongs with the argument the body just made,
        not after the commercial list.
      -->
      <PrincipleGrid
        v-if="principles"
        :heading="principles.heading"
        :leading="principles.leading"
        :items="principles.items"
        :note="principles.note"
      />

      <section v-if="cards?.length" class="ssg-business__cards">
        <h2 class="ssg-business__cards-heading">{{ cardsHeading }}</h2>
        <BentoGrid :tiles="tiles" />
      </section>

      <slot />
    </article>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Breadcrumbs from '../shared/Breadcrumbs.vue'
import BentoGrid from '../shared/BentoGrid.vue'
import CtaButton from '../shared/CtaButton.vue'
import PageContent from '../shared/PageContent.vue'
import HeroDemo from '../shared/HeroDemo.vue'
import PrincipleGrid from '../shared/PrincipleGrid.vue'
import { headerImageStyle } from '../design.js'
import type { PageProps } from '../shared/types.js'

/**
 * Business/multi-page template page.
 *
 * Reuses the shared prose renderer (with its lazily-loaded markdown and media
 * player) and the shared tile grid, so a service page costs no extra JavaScript
 * beyond what the landing template already ships.
 */
const props = defineProps<PageProps & { breadcrumbs?: string[] }>()

const demoSteps = computed(() => props.demo?.steps ?? [])

/**
 * The band takes decoration from exactly one source.
 *
 * Both candidates are painted in the band's right-hand third and the illustration
 * is a background image, so it would sit *behind* the demo's dot grid and the two
 * would read as noise. Choosing here also keeps the CSS simple: one style
 * binding, no stacking-context juggling.
 */
const bandStyle = computed(() =>
  demoSteps.value.length ? undefined : headerImageStyle(props.headerImage)
)

const tiles = computed(() =>
  (props.cards ?? []).map((card) => ({
    header: card.header,
    content: card.content,
    icon: card.icon,
    cta:
      card.cta?.route && card.cta.message
        ? { message: card.cta.message, route: card.cta.route }
        : undefined
  }))
)

/**
 * The heading above the card band.
 *
 * A label, not page content, so it comes from the site's `extra` — the same key
 * `Landing.vue` reads for its own card band — and falls back to the English
 * word. A site whose pages are not all in English sets the right one per page
 * from its route table, which is why this is not a frontmatter field: the same
 * word would then be typed into every page that shows cards.
 */
const cardsHeading = computed(
  () => (props.extra?.cardsHeading as string | undefined) ?? 'Services'
)
</script>
