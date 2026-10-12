<template>
  <section v-if="image" class="ssg-hero__image">
    <!--
      A plain `<img>` rather than `q-img`: the hero image is the LCP element, so it
      must be discovered by the preload scanner and start fetching immediately. An
      explicit width/height reserves the space and prevents layout shift, and
      `fetchpriority="high"` puts it ahead of the deferred JavaScript.
    -->
    <img
      :src="image.src"
      :alt="image.alt ?? ''"
      :width="image.width ?? 1200"
      :height="image.height ?? 750"
      sizes="(max-width: 1023px) 100vw, 45vw"
      fetchpriority="high"
      decoding="async"
    />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  image?: {
    src: string
    alt?: string
    width?: number
    height?: number
  }
}>()
</script>

<style scoped>
.ssg-hero__image img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--ssg-radius);
}
</style>
