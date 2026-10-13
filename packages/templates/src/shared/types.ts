/** Props shared by the layout and the page components. */

export interface SitePage {
  id: string
  title?: string
  label?: string
  description?: string
  icon?: { name: string; color?: string }
  content?: string
  cards?: {
    header: string
    content: string
    icon?: string
    cta?: { message: string; route?: string }
  }[]
  lists?: {
    header?: string
    dense?: boolean
    items: {
      label: string
      overline?: string
      caption?: string
      icon?: { name: string; color?: string }
      href?: string
    }[]
  }[]
  videos?: { src: string; type: string }[]
  images?: { name: string; src: string; caption?: string }[]
  subpages?: string[]
  tags?: string[]
  /** Sort weight; the home page is always first. */
  order?: number
  /**
   * The page's primary call to action.
   *
   * This MUST be declared here: with a type-only `defineProps`, Vue derives the
   * runtime props from the type, so a field absent from the type is never exposed
   * as a prop — the passed value silently lands in `attrs` instead and
   * `props.cta` reads as `undefined`.
   */
  cta?: {
    message: string
    route?: string
    /** Absolute destination (`tel:`, `mailto:`); ignored when `route` is set. */
    href?: string
  }
  /** Question/answer pairs rendered as an FAQ and mirrored into FAQPage JSON-LD. */
  faq?: { question: string; answer: string }[]
  meta?: Record<string, unknown>
  extra?: Record<string, unknown>
  /** Excluded from the sitemap and marked `noindex`. */
  noindex?: boolean
  /**
   * Illustration for the page's header band, rendered as the band's background.
   *
   * Declared here, not only on `SeoPage`: a field missing from this type is
   * never exposed as a prop (Vue derives runtime props from the type), so the
   * frontmatter value would land in `attrs` and the band would render without
   * its background.
   */
  headerImage?: string
  /** Rendered in the hero rather than the body. */
  page?: string
  [key: string]: unknown
}

export interface SiteThing {
  label: string
  [key: string]: unknown
}

export interface SiteExtra {
  /** Primary business phone number, rendered as a `tel:` link. */
  phone?: string
  email?: string
  address?: string
  instagramUrl?: string
  facebookUrl?: string
  mapUrl?: string
  rating?: number
  reviewCount?: number
  reviewSource?: string
  /** Towns/regions served — also feeds `LocalBusiness.areaServed`. */
  serviceArea?: string[]
  /** Trade licence or company registration number. */
  registration?: string
  insured?: boolean
  /** Real customer reviews shown in the trust section. */
  reviews?: { name: string; text: string; rating?: number }[]
  [key: string]: unknown
}

/** Structured-data block for the business itself (NAP, hours, rating). */
export interface SeoBusiness {
  /** Schema.org type, e.g. `LocalBusiness`, `MedicalClinic`, `Restaurant`. */
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
  geo?: { latitude: number; longitude: number }
  areaServed?: string[]
  openingHours?: {
    days: string[]
    opens: string
    closes: string
  }[]
  priceRange?: string
  sameAs?: string[]
  [key: string]: unknown
}

/** Everything the SEO builders need that is not on the page itself. */
export interface SeoContext {
  /** Site name, used in the `<title>` suffix and in structured data. */
  title: string
  /** Absolute origin, e.g. `https://example.com`. No trailing slash. */
  url: string
  description?: string
  favicon?: string
  /** Absolute URL used as the default OpenGraph/Twitter image. */
  image?: string
  /** Twitter @handle for `twitter:site`. */
  twitter?: string
  /** BCP-47 tag, e.g. `en` or `nl-NL`. Emitted as `<html lang>` and `og:locale`. */
  lang?: string
  extra?: SiteExtra
  jsonLd?: {
    business?: SeoBusiness
  }
}

/** A page as the SEO builders see it (a superset of what the route carries). */
export interface SeoPage {
  id: string
  title?: string
  label?: string
  description?: string
  /** Absolute or root-relative image for social cards. */
  image?: string
  noindex?: boolean
  /** ISO date of last modification, for the sitemap. */
  lastmod?: string
  /** Breadcrumb trail, outermost first, e.g. `['Guides', 'Install']`. */
  breadcrumbs?: string[]
  /**
   * Illustration for the page header band, rendered as the band's background.
   * Distinct from `image`, which is the social-card image: an OG image is a
   * self-contained card, a header illustration is decoration behind the title.
   */
  headerImage?: string
  /**
   * BCP-47 tag for this page when it differs from the site default — `nl` on a
   * Dutch page of an otherwise English site. Drives `<html lang>`, `og:locale`
   * and the JSON-LD `inLanguage`, so a translated page is not announced to a
   * crawler as English.
   */
  lang?: string
  /**
   * Other-language versions of this page, rendered as `rel="alternate"`
   * hreflang links and `og:locale:alternate`.
   *
   * Include this page's own language in the list: a self-referencing hreflang is
   * what makes the cluster valid, and without it a crawler has to guess which
   * version is canonical.
   */
  alternates?: { lang: string; path: string; label?: string }[]
  /** Question/answer pairs mirrored into FAQPage structured data. */
  faq?: { question: string; answer: string }[]
  tags?: string[]
  [key: string]: unknown
}

export interface LayoutProps {
  title: string
  favicon?: string
  pages?: SitePage[]
  tags?: Record<string, SiteThing>
  extra?: SiteExtra
  /** Absolute site origin, used to build canonical URLs. */
  url?: string
  description?: string
  /** BCP-47 tag, e.g. `en` — emitted as `<html lang>` and `og:locale`. */
  lang?: string
  /** Default OpenGraph/Twitter image. */
  image?: string
  twitter?: string
  jsonLd?: { business?: SeoBusiness }
}

export interface PageContentProps {
  content?: string
  lists?: SitePage['lists']
  videos?: SitePage['videos']
  images?: SitePage['images']
  /**
   * Shift markdown headings down one level. Defaults to `true` because the page
   * shell already renders the `<h1>`.
   */
  demoteMarkdownHeadings?: boolean
}

export interface PageProps extends SitePage, PageContentProps {
  pages?: SitePage[]
}
