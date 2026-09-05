/*
 * Типы коллекций Directus. Должны совпадать с directus/scripts/seed-schema.mjs
 * (и с directus/schema/snapshot.yaml после правок в админке).
 */

export type Status = 'published' | 'draft' | 'archived'

export interface DirectusFile {
  id: string
  title?: string | null
  type?: string | null
  width?: number | null
  height?: number | null
}

/** Файл в ответе может прийти как id, как объект, а в моках — как готовый путь. */
export type ImageRef = string | DirectusFile | null | undefined

export interface SiteSettings {
  id: string
  brand_name: string | null
  phone: string | null
  phone_href: string | null
  email: string | null
  address: string | null
  about: string | null
  copyright: string | null
  vk_url: string | null
  telegram_url: string | null
  whatsapp_url: string | null
  lk_url: string | null
  favorites_url: string | null
}

export interface Landing {
  id: string
  seo_title: string | null
  seo_description: string | null
  seo_image: ImageRef
  hero_title: string | null
  hero_search_placeholder: string | null
  promo_title: string | null
  promo_accent: string | null
  promo_button_label: string | null
  promo_button_url: string | null
  promo_image: ImageRef
  /** Иллюстрация маскота над полкой «Популярные туры» */
  mascot_image: ImageRef
  /** Барс в полный рост, сидит на границе полотна и футера */
  mascot_full_image: ImageRef
  excursions_title: string | null
  excursions_all_url: string | null
  tours_title: string | null
  tours_all_url: string | null
  destinations_title: string | null
  destinations_all_url: string | null
  reviews_title: string | null
  reviews_badge: string | null
  reviews_subtitle: string | null
  reviews_all_url: string | null
  why_title: string | null
  lead_title: string | null
  lead_subtitle: string | null
  lead_note: string | null
  lead_success: string | null
}

export type MenuPlacement =
  'header' | 'footer_travel' | 'footer_company' | 'footer_legal'

export interface MenuItem {
  id: string
  status: Status
  sort: number | null
  label: string
  url: string
  placement: MenuPlacement
  active: boolean
  /** id родительского пункта: так собираются выпадающие списки шапки */
  parent: string | null
}

export interface HeroSlide {
  id: string
  status: Status
  sort: number | null
  image: ImageRef
  title: string
  subtitle: string | null
  url: string | null
}

export interface Destination {
  id: string
  status: Status
  sort: number | null
  name: string
  slug: string | null
  kicker: string | null
  programs_label: string | null
  price_from: number | null
  url: string | null
  image: ImageRef
  featured: boolean
}

export type TourKind = 'excursion' | 'tour'

export interface Tour {
  id: string
  status: Status
  sort: number | null
  kind: TourKind
  title: string
  slug: string | null
  tag: string | null
  destination: string | Destination | null
  place_label: string | null
  duration_label: string | null
  price_from: number | null
  price_prefix: string | null
  price_note: string | null
  url: string | null
  image: ImageRef
  featured: boolean
}

export type AdvantageIcon = 'bus' | 'seat' | 'pin' | 'shield' | 'star'

export interface Advantage {
  id: string
  status: Status
  sort: number | null
  icon: AdvantageIcon
  title: string
  text: string | null
  link_label: string | null
  link_url: string | null
}

export interface Review {
  id: string
  status: Status
  sort: number | null
  author: string
  meta: string | null
  rating: number | null
  text: string | null
  tour: string | Tour | null
}

export interface Subscriber {
  id: string
  email: string
  source: string | null
}

export interface Lead {
  id: string
  status: 'new' | 'in_progress' | 'done'
  name: string | null
  phone: string | null
  email: string | null
  message: string | null
  source: string | null
}

/** Схема для типизированного SDK: createDirectus<Schema>() */
export interface Schema {
  site_settings: SiteSettings
  landing: Landing
  menu_items: MenuItem[]
  hero_slides: HeroSlide[]
  destinations: Destination[]
  tours: Tour[]
  advantages: Advantage[]
  reviews: Review[]
  subscribers: Subscriber[]
  leads: Lead[]
}

/** Всё, что нужно главной странице, одним объектом. */
export interface LandingData {
  source: 'directus' | 'mock'
  settings: SiteSettings
  landing: Landing
  menu: MenuItem[]
  heroSlides: HeroSlide[]
  excursions: Tour[]
  tours: Tour[]
  destinations: Destination[]
  advantages: Advantage[]
  reviews: Review[]
}
