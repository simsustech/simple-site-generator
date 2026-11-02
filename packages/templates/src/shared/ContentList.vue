<template>
  <q-list :dense="list.dense">
    <!--
      Een echte kop, geen `q-item-label`: de kop van een lijst is een sectiekop
      ("E-mail", "Telefoonnummers") en moet met een schermlezer aan te springen
      zijn. Als label was het 14px tekst zonder niveau.
    -->
    <h2 v-if="list.header" class="ssg-content__list-heading">
      {{ list.header }}
    </h2>
    <q-item
      v-for="item in list.items"
      :key="item.label"
      :clickable="item.href !== undefined"
      :href="item.href"
    >
      <q-item-section v-if="item.icon" avatar>
        <q-icon :name="item.icon.name" :color="item.icon.color" />
      </q-item-section>
      <q-item-section>
        <q-item-label v-if="item.overline" overline>
          {{ item.overline }}
        </q-item-label>
        <q-item-label>{{ item.label }}</q-item-label>
        <q-item-label v-if="item.caption" caption>
          {{ item.caption }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import type { SitePage } from './types.js'

/**
 * One frontmatter `lists:` entry: a heading and its items.
 *
 * Extracted from `PageContent` so the same markup can be rendered twice — once
 * plainly and once inside `QNoSsr` — without keeping two copies of it in step.
 */
const props = defineProps<{
  list: NonNullable<SitePage['lists']>[number]
}>()

const { list } = toRefs(props)
</script>
