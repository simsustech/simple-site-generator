<template>
  <a
    v-if="href"
    :href="href"
    class="ssg-cta ssg-cta--secondary"
    :data-ssg="dataSsg"
  >
    <q-icon v-if="icon" :name="icon" aria-hidden="true" />
    <span>{{ label }}</span>
  </a>
  <q-btn
    v-else
    :to="route"
    :label="label"
    :icon="icon"
    :color="variant === 'primary' ? 'primary' : undefined"
    :text-color="variant === 'primary' ? 'white' : undefined"
    :outline="variant === 'secondary'"
    :flat="variant === 'ghost'"
    :size="size"
    no-caps
    :data-ssg="dataSsg"
    class="ssg-cta"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Button text. Keep it to one clear action. */
    label: string
    /** In-app route. Ignored when `href` is set. */
    route?: string
    /** Absolute or `tel:`/`mailto:` destination — renders a plain anchor. */
    href?: string
    icon?: string
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: string
    /** Test/E2E hook, e.g. `hero-cta`. */
    dataSsg?: string
  }>(),
  {
    variant: 'primary',
    size: 'lg'
  }
)
</script>
