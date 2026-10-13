<template>
  <main
    class="ssg-section flex flex-center text-center min-h-[60vh] bg-[var(--q-surface-container-low)] text-[var(--q-on-surface)]"
  >
    <div class="ssg-section__inner">
      <!--
        A real `h1`: the 404 page is a page like any other, and `ssg verify`
        requires exactly one `h1` on every page. Using a styled `div` here would
        make the site fail its own check.
      -->
      <h1 class="text-[clamp(5rem,18vw,10rem)] leading-none m-0">404</h1>

      <p class="text-step-1 opacity-80 mt-space-2 mb-0">Sorry, nothing here.</p>

      <!--
        The kit's own action: it carries the primary/on-primary pair, so this
        button cannot drift into a hand-picked colour. An earlier version of this
        page used `color="white" text-color="blue"`, which measured 2.54:1 and put
        a Quasar-blue label on a green page.
      -->
      <CtaButton class="mt-space-4" label="Go home" route="/" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { CtaButton } from '@simple-site-generator/templates'

// Keep the name — `ssg check` and the router both key off it.
defineOptions({ name: 'Error404Page' })
</script>
