/** Props shared by the layout and the page components. */

export interface SitePage {
  id: string
  title?: string
  /**
   * The page's document title, used verbatim — no ` | <site-name>` suffix.
   *
   * For a page whose `<h1>` is not the right words for a browser tab, which is
   * the front page: its heading is a sentence, and its title in a tab is the
   * site's name.
   *
   * Declared on this type, like `cta` and `principles` below, because `routes.ts`
   * spreads the frontmatter into the page as props: a field Vue's runtime props
   * do not know about lands in `attrs` and is rendered onto the root element as
   * an attribute.
   */
  headTitle?: string
  label?: string
  description?: string
  /**
   * The page's language, when the site serves more than one.
   *
   * Optional on purpose. A single-language site declares it nowhere and the
   * navigation behaves exactly as it did before this existed; a site whose pages
   * are in more than one language declares it — or derives it in its route table
   * from an id convention, as the simsustech site does — and each page then gets
   * the menu of its own language rather than the default language's.
   */
  lang?: string
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
    /**
     * Render this list in the browser only, so its contents never reach the
     * prerendered HTML. For a link that spammers harvest — a WhatsApp or
     * telephone link — being in the source is the whole problem.
     */
    clientOnly?: boolean
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
    /**
     * The quieter action beside the primary one.
     *
     * The hero carries two on purpose: the primary is the one the page is for,
     * and the second is the reader who is not ready yet — without it that reader
     * has to go back to the menu. Rendered as an outlined button, so the
     * hierarchy is visible before anything is read.
     */
    secondary?: { message: string; route?: string; href?: string }
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
  /**
   * The hero's process graphic: a route with the given stops, drawn and
   * animated as an inline SVG (`shared/HeroDemo.vue`).
   *
   * Declared on this type, not only in the page schema: Vue derives the runtime
   * props from the type, so a field missing here is never exposed as a prop —
   * the frontmatter value would land in `attrs` and the graphic would silently
   * never render. That is the same trap `cta` and `headerImage` document above.
   *
   * Two stops are the minimum (a route needs something to run between) and five
   * is about where the labels start to collide.
   */
  demo?: {
    /** Stop labels, in order along the route. */
    steps: string[]
    /** Accessible name for the graphic; falls back to the stop labels. */
    label?: string
  }
  /**
   * The principles band: the rules the work follows, as numbered cards.
   *
   * Replaces what used to be an illustration. An image of text is not content —
   * it cannot be selected, searched, translated or reflowed, and it is the one
   * kind of figure that is guaranteed to be the wrong size for someone. Declared
   * here for the same reason as `demo`: a field missing from the type never
   * reaches the component as a prop.
   */
  principles?: {
    /** Section heading, rendered as `<h2>`. */
    heading?: string
    /** One line under it, setting up why the list exists. */
    leading?: string
    items: { title: string; text: string }[]
    /** A closing line — the consequence, not another rule. */
    note?: string
  }
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
  /**
   * The customer's own environment, linked from the header.
   *
   * Absent is the normal state: the address belongs to the owner and a site
   * ships before it arrives. The header renders no button while this is empty,
   * because a button that points nowhere is worse than no button.
   */
  clientLoginUrl?: string
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
  /**
   * The heading above the service-card band, for a site that does not want the
   * templates' English word (`business/Page.vue`, `landing/Landing.vue`).
   *
   * Site-wide here because that is the shape of this bag; a site whose pages are
   * not all in one language passes the right one per page from its route table
   * instead (see the simsustech site's `routes.ts`).
   */
  cardsHeading?: string
  /**
   * Chrome labels, for a site that is not in English.
   *
   * The header's two built-in controls — the theme switch and the customer-login
   * link — are the only strings in the shared chrome that are not already the
   * site's own: every other label comes from a page's `tags`. Hardcoded English
   * in a Dutch header reads as a template left half-translated, so these travel
   * the same way `cardsHeading` does: from the site's own configuration.
   */
  labels?: {
    /** Names the action: shown while the light theme is active. */
    dark?: string
    /** Names the action: shown while the dark theme is active. */
    light?: string
    clientLogin?: string
    /**
     * The strings the shared chrome renders itself.
     *
     * `dark`, `light` and `clientLogin` above were the first three, because the
     * header's controls are the only visible chrome text. Everything below is
     * either an accessible name on an icon-only control or a heading the footer
     * invents (`Contact`, `Follow`), and on a site that does not speak English
     * those read as a template left half-translated — to a screen-reader user
     * most of all, who hears `Primary`, `Sections` and `Back to top` in English
     * on a Dutch page.
     *
     * Every entry falls back to the English word, so a site that sets none of
     * them renders exactly what it rendered before this existed.
     */
    /** Accessible name of the skip link. */
    skipToContent?: string
    /** Accessible name of the control that opens the drawer. */
    openNavigation?: string
    /** Accessible name of the desktop menu navigation. */
    primary?: string
    /** Accessible name of the drawer's navigation. */
    navigation?: string
    /** Accessible name of the drawer's page-list navigation. */
    sections?: string
    /** Accessible name of the footer navigation. */
    footer?: string
    /** Heading above the address, phone and email in the footer. */
    contact?: string
    /** Heading above the social links in the footer. */
    follow?: string
    /** Accessible name of the overflow menu. */
    moreOptions?: string
    /** Accessible name of the scroll-to-top control. */
    backToTop?: string
    /** Accessible name of the gallery's previous-image control. */
    previousImage?: string
    /** Accessible name of the gallery's next-image control. */
    nextImage?: string
    /** The sticky bar's secondary action, e.g. "Reserveren". */
    book?: string
    /** The sticky bar's primary action, e.g. "Bel ons". */
    call?: string
    /**
     * The proof section's own strings: its two headings and the terms of the
     * facts list. A local business's trust block is the last place an English
     * label should appear, and on a Dutch site it sits right before the visitor
     * decides to call.
     */
    proofHeading?: string
    proofFacts?: string
    serviceArea?: string
    address?: string
    phone?: string
    registration?: string
    insurance?: string
    insured?: string
    notInsured?: string
  }
  /**
   * Trust marks — trade association, certification, keurmerk.
   *
   * Rendered by the shared footer, on every page, because proof a visitor never
   * sees is not proof. The list stays absent on a site without marks, so nothing
   * renders until one is declared.
   */
  qualityMarks?: {
    /** Accessible name; the mark is usually an image of a word, so it needs one. */
    name: string
    /** Root-relative path or absolute URL to the mark's image. */
    imageUrl: string
    /** Where the mark leads, when it links to the issuing body. */
    url?: string
    /**
     * The mark's own aspect, in pixels.
     *
     * An SVG whose root carries only a `viewBox` has no intrinsic size, and an
     * `<img>` with `width:auto; height:auto` then lays out at 0×0: a mark that
     * occupies space in the DOM, paints nothing, and reports no error anywhere.
     * These two values give the browser a ratio to reserve. Omitted, the image
     * falls back to a 112×48 box that letterboxes rather than distorts.
     */
    width?: number
    height?: number
  }[]
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
  /**
   * Replaces the document title outright, suffix and all.
   *
   * The suffix (and the `og:site_name` beside it) exists to name the site inside
   * a page's title; the front page *is* the site, so there it would say the name
   * twice. Declaring the exception on the page — rather than teaching this layer
   * which page is the front page — is what keeps it correct on a multilingual
   * site, where the Dutch front page has `id: nl` and not `home`.
   */
  headTitle?: string
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
