<template>
  <footer class="ssg-footer" role="contentinfo">
    <div class="ssg-footer__inner">
      <nav class="ssg-footer__nav" :aria-label="footerLabel">
        <ul class="ssg-footer__list">
          <li v-for="page in footerPages" :key="page.id">
            <router-link class="ssg-footer__link" :to="`/${page.id}`">
              {{ page.label }}
            </router-link>
          </li>
        </ul>
      </nav>

      <!--
        Trust marks — a trade association or certification a visitor can verify.
        The image is the mark, so its name is the alt text; a mark that links to
        the issuing body is wrapped in an anchor, and one that does not is left
        as an image rather than pointing somewhere invented.
      -->
      <div v-if="qualityMarks.length" class="ssg-footer__marks">
        <ul class="ssg-footer__list ssg-footer__list--inline">
          <li v-for="mark in qualityMarks" :key="mark.name">
            <a
              v-if="mark.url"
              class="ssg-footer__mark"
              :href="mark.url"
              rel="noopener noreferrer"
              target="_blank"
            >
              <img
                class="ssg-footer__mark-image"
                :src="mark.imageUrl"
                :alt="mark.name"
                :width="mark.width ?? 112"
                :height="mark.height ?? 48"
                loading="lazy"
                decoding="async"
              />
            </a>
            <img
              v-else
              class="ssg-footer__mark-image"
              :src="mark.imageUrl"
              :alt="mark.name"
              :width="mark.width ?? 112"
              :height="mark.height ?? 48"
              loading="lazy"
              decoding="async"
            />
          </li>
        </ul>
      </div>

      <div v-if="hasContact" class="ssg-footer__contact">
        <h2 class="ssg-footer__heading">{{ contactLabel }}</h2>
        <ul class="ssg-footer__list">
          <li v-if="extra?.address">{{ extra.address }}</li>
          <li v-if="extra?.phone">
            <a class="ssg-footer__link" :href="telHref(extra.phone)">
              {{ extra.phone }}
            </a>
          </li>
          <li v-if="extra?.email">
            <a class="ssg-footer__link" :href="`mailto:${extra.email}`">
              {{ extra.email }}
            </a>
          </li>
        </ul>
      </div>

      <div v-if="socialLinks.length" class="ssg-footer__social">
        <h2 class="ssg-footer__heading">{{ followLabel }}</h2>
        <ul class="ssg-footer__list ssg-footer__list--inline">
          <li v-for="link in socialLinks" :key="link.href">
            <a
              class="ssg-footer__link"
              :href="link.href"
              rel="noopener noreferrer"
              target="_blank"
            >
              <q-icon :name="link.icon" aria-hidden="true" />
              <span class="ssg-footer__sr">{{ link.label }}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <p class="ssg-footer__legal">© {{ year }} {{ title }}</p>
    <!--
      Who built the site, when the site says so.

      The kit's own legal line names the business; a site that credited its maker
      in that line — `© <builder> <business>` — lost the credit when the shell
      moved into the kit. A credit is
      the site owner's decision, not the template's, so it is a separate line that
      renders only when `extra.credit` is set.
    -->
    <p v-if="credit" class="ssg-footer__credit">{{ credit }}</p>
  </footer>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { footerPagesOf } from './nav.js'
import type { LayoutProps } from './types.js'
import { telHref } from './tel.js'

const props =
  defineProps<Pick<LayoutProps, 'title' | 'pages' | 'extra' | 'lang'>>()

const { pages, extra } = toRefs(props)

const footerPages = computed(() => footerPagesOf(pages.value, props.lang))

const hasContact = computed(() =>
  Boolean(extra.value?.address || extra.value?.phone || extra.value?.email)
)

/**
 * The two headings and the navigation's accessible name.
 *
 * Invented by this component rather than declared by a page, so they cannot come
 * from `tags`: `Contact` here is a column heading, not the label of the contact
 * menu. A site that speaks another language sets them in `extra.labels`, and the
 * English words remain the fallback.
 */
const footerLabel = computed(() => extra.value?.labels?.footer ?? 'Footer')
const contactLabel = computed(() => extra.value?.labels?.contact ?? 'Contact')
const followLabel = computed(() => extra.value?.labels?.follow ?? 'Follow')

/**
 * The marks, checked rather than trusted: `extra` is an open bag, and a mark
 * without an image would render an empty `img` — a broken-image icon in the
 * footer of every page.
 */
const qualityMarks = computed(() =>
  (extra.value?.qualityMarks ?? []).filter(
    (mark) =>
      typeof mark?.name === 'string' &&
      mark.name.trim().length > 0 &&
      typeof mark?.imageUrl === 'string' &&
      mark.imageUrl.trim().length > 0
  )
)

const socialLinks = computed(() => {
  const links: { href: string; icon: string; label: string }[] = []

  if (extra.value?.instagramUrl) {
    links.push({
      href: extra.value.instagramUrl,
      icon: 'i-mdi-instagram',
      label: 'Instagram'
    })
  }

  if (extra.value?.facebookUrl) {
    links.push({
      href: extra.value.facebookUrl,
      icon: 'i-mdi-facebook',
      label: 'Facebook'
    })
  }

  return links
})

const year = new Date().getFullYear()

/**
 * The builder's credit, when the site carries one.
 *
 * Trimmed and empty-checked like every other string the chrome reads from
 * `extra`: the bag is open, and an empty `<p>` still takes the footer's spacing.
 */
const credit = computed(() => {
  const value = extra.value?.credit

  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined
})
</script>
