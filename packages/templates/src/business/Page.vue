<template>
  <q-page class="ssg-section">
    <article class="ssg-section__inner">
      <Breadcrumbs v-if="breadcrumbs?.length" :trail="breadcrumbs" />

      <!--
        The page title, and nothing else. The band that used to sit here carried a
        description and an action; the description was the meta description and
        the action was repeated on every page, which made one block the loudest
        thing on ten pages in a row. A page that wants an action says so in its
        own prose; the fixed bar carries booking and calling on a phone.
      -->
      <header
        class="ssg-business__header"
        :class="{ 'ssg-business__header--decorated': decorated }"
        :style="bandStyle"
      >
        <!--
          The copy comes first in the DOM and the graphic second: the band is a
          row from `lg` (`justify-content: space-between`), so source order is
          what puts the title on the left and the picture on the right. It also
          puts the document's `<h1>` before the figure, which is the order a
          screen reader should hear them in — the graphic is `role="img"` with a
          name of its own, and it is not the page's subject.
        -->
        <div
          class="ssg-business__band-copy"
          :class="{ 'ssg-business__band-copy--narrow': demoSteps.length > 0 }"
        >
          <!--
            The page owns the document's single <h1>. `PageContent` demotes markdown
            headings so the body starts at `<h2>` and the outline stays valid.

            Title only. The frontmatter `description` is the page's meta
            description — the sentence a search result shows — and printing it
            under the title promoted it to a subtitle. A page that wants an intro
            says so in its own markdown, where prose belongs.
          -->
          <h1 class="ssg-business__title">{{ title }}</h1>
        </div>

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
      </header>

      <PageContent
        :content="content"
        :lists="lists"
        :videos="videos"
        :images="images"
        :labels="(extra as SiteExtra | undefined)?.labels"
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

      <!--
        The page's own primary action, when the frontmatter declares one.

        `cta` was a dead field on this template: the band used to render it, the
        band lost it when it was cut back to a title, and every page that declared
        one — both contact pages on the reference site, ten pages on the second
        site — got nothing. Not in the band: an action repeated above the fold on
        every page is the thing that made that block the loudest on ten pages in a
        row. It closes the page instead, after the prose it belongs to, which is
        where a reader who has just been convinced needs it.

        `href` carries `mailto:` and `tel:` just as well as `route` carries an
        in-app path, so a contact page asks for the email without a form.
      -->
      <div v-if="cta" class="ssg-business__action">
        <CtaButton
          :label="cta.message"
          :route="cta.route"
          :href="cta.href"
          variant="primary"
          data-ssg="page-cta"
        />
      </div>

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
import type { PageProps, SiteExtra } from '../shared/types.js'

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

/**
 * Whether the header carries decoration behind its copy.
 *
 * A plain title row is the default; a page that asks for a `demo` or a
 * `headerImage` gets the panel back, because both are painted behind the title
 * and need a surface of their own to be legible.
 */
const decorated = computed(
  () => demoSteps.value.length > 0 || Boolean(props.headerImage)
)

const tiles = computed(() =>
  (props.cards ?? []).map((card) => ({
    header: card.header,
    content: card.content,
    icon: card.icon,
    image: card.image,
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
