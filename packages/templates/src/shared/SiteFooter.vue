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

const props = defineProps<Pick<LayoutProps, 'title' | 'pages' | 'extra'>>()

const { pages, extra } = toRefs(props)

const footerPages = computed(() => footerPagesOf(pages.value))

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

<style scoped>
.ssg-footer {
  padding: var(--ssg-space-4) var(--ssg-space-3) var(--ssg-space-3);
}

.ssg-footer__inner {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ssg-space-4);
  width: 100%;
  max-width: var(--ssg-content-width);
  margin-inline: auto;
}

.ssg-footer__nav,
.ssg-footer__contact,
.ssg-footer__social {
  flex: 1 1 12rem;
  min-width: 0;
}

.ssg-footer__heading {
  font-size: var(--ssg-step-0);
  margin: 0 0 var(--ssg-space-1);
}

.ssg-footer__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ssg-space-1);
  font-size: var(--ssg-step--1);
}

.ssg-footer__list--inline {
  flex-direction: row;
  gap: var(--ssg-space-3);
}

.ssg-footer__link {
  color: inherit;
  text-decoration: underline;
}

/* Visually hidden but available to screen readers, so an icon-only social link
   still has an accessible name. */
.ssg-footer__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.ssg-footer__legal {
  width: 100%;
  max-width: var(--ssg-content-width);
  margin: var(--ssg-space-4) auto 0;
  padding-inline: var(--ssg-space-3);
  font-size: var(--ssg-step--1);
}
</style>
