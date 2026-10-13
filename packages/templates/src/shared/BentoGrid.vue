<template>
  <section
    class="ssg-section"
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
 * Modular tile grid for services or value propositions.
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
      cta?: { message: string; route: string }
    }[]
  }>(),
  { muted: false }
)
</script>
