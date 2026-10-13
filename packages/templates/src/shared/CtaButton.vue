<template>
  <q-btn
    :to="route"
    :href="href"
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
    /**
     * Absolute or `tel:`/`mailto:` destination. Rendered by `q-btn`, so it keeps
     * the button styling the variant asks for and is still a real link.
     */
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
