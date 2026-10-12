// Types for the virtual modules the build injects. Without these, every import
// from `virtual:ssg:*` is an unresolved module in the editor and in any
// type-check of this app.

declare module 'virtual:ssg:site' {
  interface SsgTag {
    label: string
  }

  interface SsgExtra {
    phone?: string
    email?: string
    address?: string
    instagramUrl?: string
    facebookUrl?: string
    mapUrl?: string
    rating?: number
    reviewCount?: number
    reviewSource?: string
  }

  interface SsgBusiness {
    type?: string
    name?: string
    description?: string
    telephone?: string
    email?: string
    address?: {
      streetAddress?: string
      postalCode?: string
      addressLocality?: string
      addressCountry?: string
    }
    areaServed?: string[]
    openingHours?: { days: string[]; opens: string; closes: string }[]
    priceRange?: string
  }

  /**
   * Site identity only. Deliberately NOT the whole build config: this module is
   * evaluated in the browser, so anything added here ships to every visitor.
   */
  export const site: {
    title: string
    url: string
    favicon?: string
    description?: string
    lang?: string
    image?: string
    twitter?: string
    template: string
    templatePackage: string
    tags: Record<string, SsgTag>
    extra?: SsgExtra
    jsonLd?: { business?: SsgBusiness }
  }
}

declare module 'virtual:ssg:template' {
  import type { Component } from 'vue'

  export const Layout: Component
  export const Page: Component
  /** Optional page components a template may expose, e.g. `Landing`. */
  const template: Record<string, Component>
  export default template
}
