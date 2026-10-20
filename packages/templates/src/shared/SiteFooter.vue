<template>
  <footer class="ssg-footer" role="contentinfo">
    <div class="ssg-footer__inner">
      <nav class="ssg-footer__nav" aria-label="Footer">
        <ul class="ssg-footer__list">
          <li v-for="page in footerPages" :key="page.id">
            <router-link class="ssg-footer__link" :to="`/${page.id}`">
              {{ page.label }}
            </router-link>
          </li>
        </ul>
      </nav>

      <div v-if="hasContact" class="ssg-footer__contact">
        <h2 class="ssg-footer__heading">Contact</h2>
        <ul class="ssg-footer__list">
          <li v-if="extra?.address">{{ extra.address }}</li>
          <li v-if="extra?.phone">
            <a class="ssg-footer__link" :href="`tel:${extra.phone}`">
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
        <h2 class="ssg-footer__heading">Follow</h2>
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
  </footer>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { footerPagesOf } from './nav.js'
import type { LayoutProps } from './types.js'

const props =
  defineProps<Pick<LayoutProps, 'title' | 'pages' | 'extra' | 'lang'>>()

const { pages, extra } = toRefs(props)

const footerPages = computed(() => footerPagesOf(pages.value, props.lang))

const hasContact = computed(() =>
  Boolean(extra.value?.address || extra.value?.phone || extra.value?.email)
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
</script>
