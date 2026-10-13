<template>
  <main
    class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <!--
        A real `h1`: the 404 page is a page like any other, and `ssg verify`
        requires exactly one `h1` on every page. Using a styled `div` here would
        make the site fail its own check.
      -->
      <h1 class="ssg-404__code">404</h1>

      <p class="ssg-404__message">Sorry, nothing here.</p>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Go home"
        no-caps
      />
    </div>
  </main>
</template>

<script setup lang="ts">
// The file previously contained `<scirpt>` (a typo), so this block never ran and
// the component had no name. Keep the name — `ssg check` and the router both key
// off it.
defineOptions({ name: 'Error404Page' })
</script>

<style scoped>
.ssg-404__code {
  font-size: 30vh;
  line-height: 1;
  margin: 0;
}

.ssg-404__message {
  font-size: var(--ssg-step-2);
  opacity: 0.8;
  margin: var(--ssg-space-2) 0 0;
}
</style>
