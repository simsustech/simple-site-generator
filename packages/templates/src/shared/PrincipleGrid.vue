<template>
  <section v-if="items.length" class="ssg-principles" data-ssg="principles">
    <header v-if="heading || leading" class="ssg-principles__header">
      <h2 v-if="heading" class="ssg-principles__heading">{{ heading }}</h2>
      <p v-if="leading" class="ssg-principles__leading">{{ leading }}</p>
    </header>

    <!--
      An `<ol>`, not a list of divs: the order is part of the meaning ("applied
      before choosing anything"), and the list role announces it. The visible
      number is decorative on top of that, hence `aria-hidden` — otherwise a
      screen reader reads each item's position twice.
    -->
    <ol class="ssg-principles__list">
      <li
        v-for="(item, index) in items"
        :key="item.title"
        class="ssg-principles__item"
      >
        <span class="ssg-principles__mark" aria-hidden="true">
          {{ index + 1 }}
        </span>
        <h3 class="ssg-principles__title">{{ item.title }}</h3>
        <p class="ssg-principles__text">{{ item.text }}</p>
      </li>
    </ol>

    <p v-if="note" class="ssg-principles__note">{{ note }}</p>
  </section>
</template>

<script setup lang="ts">
/**
 * The principles band: the rules the work follows, as numbered cards.
 *
 * This used to be an SVG illustration (`philosophy.svg`), and the illustration
 * was the problem twice over: it was a *picture of text*, so none of it was
 * selectable, searchable or translatable, and it was authored 1200px wide while
 * the prose column capped it at 68ch — it rendered at about 40% of its size and
 * its labels were illegible before anyone thought to measure it.
 *
 * As markup it is real content: it reflows, it re-themes with `body--dark` for
 * free, it scales with the reader's font size, and it is one `<section>` of text
 * rather than a 3 KB download.
 */
withDefaults(
  defineProps<{
    /** Section heading. Rendered as `<h2>`: the page owns the `<h1>`. */
    heading?: string
    /** One line under the heading, setting up why the list exists. */
    leading?: string
    items: { title: string; text: string }[]
    /** A closing line, for the consequence rather than another rule. */
    note?: string
  }>(),
  { items: () => [] }
)
</script>
