<template>
  <a class="ssg-skip-link" href="#main">{{ label }}</a>
</template>

<script setup lang="ts">
// The first focusable element in the document. Lets keyboard and screen-reader
// users bypass the header navigation on every page.
//
// The label is a prop because it is read aloud: a Dutch site that leaves this
// hardcoded says "Skip to content" in English at the very first Tab stop.
withDefaults(defineProps<{ label?: string }>(), {
  label: 'Skip to content'
})
</script>
