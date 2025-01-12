const templates = import.meta.glob('./*/index.ts')

export interface LayoutProps {
  title: string
  favicon?: string
  pages?: PageProps[]
  tags?: Record<string, any>
  extra?: Record<string, any>
}

export interface PageProps {
  id: string
  pages?: PageProps[]
  title: string
  label: string
  description?: string
  icon?: {
    name: string
    color?: string
  }
  content?: string
  cards?: {
    header: string
    content: string
    cta: {
      message: string
      route: string
      alternative?: {
        message: string
        route: string
      }
    }
  }[]
  lists?: {
    header: string
    dense?: boolean
    items: {
      label: string
      overline?: string
      caption?: string
      icon?: {
        name: string
        color?: string
      }
      href?: string
    }[]
  }[]
  meta?: Record<string, any>
  videos?: {
    src: string
    type: string
  }[]
  images?: {
    name: string
    src: string
    caption: string
  }[]
  tags: string[]
  extra?: Record<string, any>
  subpages?: string[]
  cta?: {
    message: string
    route?: string
  }
}

export default {
  templates
}
