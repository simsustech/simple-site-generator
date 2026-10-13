<template>
  <nav
    v-if="items.length"
    aria-label="Breadcrumb"
    class="ssg-breadcrumbs"
    data-ssg="breadcrumbs"
  >
    <ol class="ssg-breadcrumbs__list">
      <li
        v-for="(item, index) in items"
        :key="item.label"
        class="ssg-breadcrumbs__item"
      >
        <router-link
          v-if="item.route && index < items.length - 1"
          class="ssg-breadcrumbs__link"
          :to="item.route"
        >
          {{ item.label }}
        </router-link>
        <span
          v-else
          :aria-current="index === items.length - 1 ? 'page' : undefined"
        >
          {{ item.label }}
        </span>
        <span
          v-if="index < items.length - 1"
          class="ssg-breadcrumbs__sep"
          aria-hidden="true"
        >
          /
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Breadcrumb trail.
 *
 * Rendered from the same `breadcrumbs` frontmatter that feeds the
 * `BreadcrumbList` structured data, so the visible trail and the structured data
 * can never disagree. The current page is the last item and is not a link.
 *
 * `items` accepts either bare labels or `{ label, route }` pairs.
 */
const props = withDefaults(
  defineProps<{
    /** Trail, outermost first. The last entry is the current page. */
    trail?: (string | { label: string; route?: string })[]
    /** Route of the parent section, used for the first crumb. */
    parentRoute?: string
  }>(),
  { trail: () => [] }
)

const items = computed(() =>
  props.trail.map((entry, index) =>
    typeof entry === 'string'
      ? {
          label: entry,
          route:
            index === 0 && props.parentRoute ? props.parentRoute : undefined
        }
      : entry
  )
)
</script>
