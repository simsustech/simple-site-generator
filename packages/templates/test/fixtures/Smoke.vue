<template>
  <section data-ssg="smoke">
    <h1>{{ title }}</h1>
    <p>{{ body }}</p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  body: string
}>()
</script>
