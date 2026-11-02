<template>
  <section
    class="ssg-section ssg-bento"
    :class="{ 'ssg-muted-surface': muted }"
    data-ssg="bento"
  >
    <div class="ssg-section__inner">
      <header v-if="heading" class="ssg-bento__header">
        <h2 class="ssg-bento__heading">{{ heading }}</h2>
        <p v-if="lede" class="ssg-bento__lede">{{ lede }}</p>
      </header>

      <div class="ssg-bento__grid">
        <article
          v-for="tile in tiles"
          :key="tile.header"
          class="ssg-bento__tile"
        >
          <!--
            The photo, when the card has one, before everything else: it is the
            card's subject and the heading only names it. The wrapper carries the
            ratio, so the space is reserved before the file arrives and nothing
            below the tile moves when it does.
          -->
          <div
            v-if="tile.image?.src"
            class="ssg-bento__media"
            :style="mediaStyle(tile.image)"
          >
            <img
              class="ssg-bento__image"
              :class="{
                'ssg-bento__image--contain': tile.image.fit === 'contain'
              }"
              :src="tile.image.src"
              :alt="tile.image.alt ?? tile.header"
              :width="tile.image.width"
              :height="tile.image.height"
              loading="lazy"
              decoding="async"
            />
          </div>

          <q-icon
            v-if="tile.icon"
            class="ssg-bento__icon"
            :name="tile.icon"
            aria-hidden="true"
          />
          <h3 class="ssg-bento__tile-header">{{ tile.header }}</h3>
          <p class="ssg-bento__tile-content">{{ tile.content }}</p>
          <router-link
            v-if="tile.cta?.route"
            class="ssg-bento__link"
            :to="tile.cta.route"
          >
            {{ tile.cta.message }}
          </router-link>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * Modular tile grid for services, value propositions or a product catalogue.
 *
 * Tiles reflow via `auto-fit` instead of collapsing to a single column at a
 * breakpoint, so the section stays scannable at every width, and each tile is a
 * real `<article>` so it has a heading of its own (`h3` under the section `h2`).
 */
withDefaults(
  defineProps<{
    heading?: string
    lede?: string
    muted?: boolean
    tiles: {
      header: string
      content: string
      icon?: string
      image?: {
        src: string
        alt?: string
        width?: number
        height?: number
        fit?: 'cover' | 'contain'
      }
      cta?: { message: string; route: string }
    }[]
  }>(),
  { muted: false }
)

/**
 * The ratio a tile reserves for its photo.
 *
 * Authored `width`/`height` win, so a portrait catalogue photo is shown whole
 * rather than cropped to a landscape box. Without them the design system's 4:3
 * default applies, which is what a service-card photo usually wants.
 */
function mediaStyle(image: { width?: number; height?: number } | undefined) {
  const { width, height } = image ?? {}

  return width && height ? { aspectRatio: `${width} / ${height}` } : undefined
}
</script>
