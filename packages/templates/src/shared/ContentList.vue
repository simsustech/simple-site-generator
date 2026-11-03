<template>
  <!--
    The heading sits OUTSIDE the list, not inside it.

    It used to be the `q-list`'s first child, and `q-list` renders
    `role="list"` — which allows only `listitem` children. A heading there is
    invalid, and so is every item that carries an `href`: Quasar renders those as
    an `<a>`, keeps the implicit link role, and a list of links therefore has no
    `listitem` children at all. Measured by Lighthouse
    (`aria-required-children`) on the contact page of a client site whose lists are
    all links — the first that presented the case.
  -->
  <h2 v-if="list.header" :id="headingId" class="ssg-content__list-heading">
    {{ list.header }}
  </h2>

  <!--
    `role="group"` rather than `list`: a group allows the heading association
    through `aria-labelledby` and allows its children to be links. Announced as
    "E-mail, group" — the same reading order the visible heading gives, without
    claiming list semantics the markup does not have.
  -->
  <q-list
    :dense="list.dense"
    role="group"
    :aria-labelledby="list.header ? headingId : undefined"
  >
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
import { toRefs, useId } from 'vue'
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

/**
 * The heading's id, for `aria-labelledby`.
 *
 * `useId` rather than a slug of the heading: a page may carry two lists with the
 * same heading, and duplicate ids would make the second group announce the first
 * one's label. Vue's id is stable between the prerender and the client, so the
 * association survives hydration.
 */
const headingId = `ssg-list-${useId()}`
</script>
