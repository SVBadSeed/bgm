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
  /** Надпись над номером: «Номер для бесплатных звонков только из России» */
  phone_kicker: string | null
  /** Пояснение под номером: когда отвечают, что делать ночью */
  phone_note: string | null
  /** Второй номер — офисный */
  phone2: string | null
  phone2_href: string | null
  phone2_note: string | null
  email: string | null
  /** Заголовок карточки офиса: «Офис в г. Новороссийск» */
  office_title: string | null
  address: string | null
  about: string | null
  copyright: string | null
  vk_url: string | null
  telegram_url: string | null
  whatsapp_url: string | null
  max_url: string | null
  /** Ссылка на карту для окна контактов; пусто — строим по адресу */
  map_url: string | null
  lk_url: string | null
  favorites_url: string | null
  /** Режим работы офиса одной строкой */
  work_hours: string | null
  /* Три строки в карточке цены на странице тура. Общие для всех туров,
     поэтому живут в настройках сайта, а не у каждого тура. */
  tour_individual_note: string | null
  tour_cancel_note: string | null
  tour_prepay_note: string | null

  /* Футер */
  /** Подпись под телефоном: «Мы всегда на связи и готовы помочь» */
  footer_phone_note: string | null
  /** Подпись под почтой: «По любым вопросам пишите на почту» */
  footer_email_note: string | null
  /** Строка реестра: «ООО «АТТ» В031-00161-00/04513871» */
  registry_line: string | null
  /** Герб или знак реестра рядом со строкой */
  registry_image: ImageRef
  /** Оценка на Яндекс Картах, например «5.0» */
  rating_value: string | null
  /** Сколько отзывов учтено в оценке */
  rating_count: number | null
  rating_url: string | null
  /** Полоска логотипов платёжных систем одной картинкой */
  payments_image: ImageRef
  /** Мелкая приписка внизу футера */
  legal_note: string | null
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
  hot_title: string | null
  hot_all_url: string | null
  /** Плашки в шапке каталога, через | */
  catalog_facts: string | null
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
  /** «Туры в …»: заполняют, только если правило склонения ошиблось */
  case_accusative: string | null
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
  /** Цена до скидки. Больше текущей — тур считается горящим */
  old_price: number | null
  /* Признаки-справочники: словари лежат в app/utils/facets.ts */
  difficulty: string | null
  transport: string | null
  /** Ставит Directus. По ней тур попадает в фильтр «Новые» */
  date_created?: string | null
  price_prefix: string | null
  price_note: string | null
  /** Цена для детей и пенсионеров — вторая строка в блоке цены */
  price_reduced: number | null
  url: string | null
  image: ImageRef
  featured: boolean

  /* Ниже — только для страницы тура; в карточках не участвует */
  /** Абзац под заголовком: о чём поездка */
  intro: string | null
  /** «от 3 лет» — ограничение по возрасту */
  age_label: string | null
  /** Что входит в стоимость, по пункту на строку */
  included: string | null
  /** Оплачивается отдельно, по пункту на строку */
  extra_costs: string | null
  hotel_name: string | null
  hotel_text: string | null
  hotel_image: ImageRef
  /** Блок «Дополнительно»: предупреждения и памятка перед поездкой */
  extra_note: string | null
  /** Ссылка на буклет: пусто — кнопки «Скачать буклет» нет */
  booklet_url: string | null
}

/** День программы тура. Отдельной коллекцией: дней от одного до десяти */
export interface TourDay {
  id: string
  status: Status
  sort: number | null
  tour: string | Tour | null
  /** «Владикавказ — Кармадонское ущелье» */
  title: string
  text: string | null
}

/** Кадр в галерее тура */
export interface TourPhoto {
  id: string
  status: Status
  sort: number | null
  tour: string | Tour | null
  image: ImageRef
}

/** Город, из которого уходит автобус */
export interface DepartureCity {
  id: string
  status: Status
  sort: number | null
  name: string
  slug: string | null
  /** «Туры из …»: заполняют, только если правило склонения ошиблось */
  case_genitive: string | null
  /** «ул. Красная, 176 · 5:30» — место и время подачи */
  pickup_note: string | null
}

/**
 * Один выезд = одна дата тура. На выездах держится всё расписание: даты на
 * карточках, сортировка «Ближайшие туры», фильтр по городу отправления.
 */
export interface Departure {
  id: string
  status: Status
  sort: number | null
  tour: string | Tour | null
  /** ISO-дата, без времени: время подачи привязано к городу */
  date_start: string
  /** Пусто у однодневных */
  date_end: string | null
  city: string | DepartureCity | null
  seats_left: number | null
  /** Пусто — берётся price_from тура */
  price: number | null
  /** Место можно выкупить сразу, без звонка менеджера */
  instant: boolean
}

export type AdvantageIcon =
  | 'bus'
  | 'seat'
  | 'pin'
  | 'shield'
  | 'star'
  | 'headset'
  | 'diamond'
  | 'plane'

export interface Advantage {
  id: string
  status: Status
  sort: number | null
  icon: AdvantageIcon
  title: string
  text: string | null
  link_label: string | null
  link_url: string | null
  /** На какой странице показывать: главная или зарубежные туры */
  page?: 'landing' | 'foreign' | null
}

export interface Review {
  id: string
  status: Status
  sort: number | null
  author: string
  /** «Краснодар · август 2026» — короткая подпись для карточки на главной */
  meta: string | null
  rating: number | null
  text: string | null
  tour: string | Tour | null
  /** «Бывалый путешественник» — сколько раз человек ездил с нами */
  traveler: string | null
  /** Город, из которого уезжали: на странице отзывов он отдельной строкой */
  city: string | DepartureCity | null
  /** Дата отзыва, ISO без времени */
  date: string | null
}

/** Фотография, приложенная к отзыву */
export interface ReviewPhoto {
  id: string
  status: Status
  sort: number | null
  review: string | Review | null
  image: ImageRef
}

/** План питания в отеле. Словарь повторён в app/utils/facets.ts */
export type MealPlan = 'ro' | 'bb' | 'hb' | 'fb' | 'ai' | 'uai'

/**
 * Пакетное предложение за границу: отель + перелёт. Отдельно от туров
 * намеренно — здесь нет ни автобуса, ни города выезда, зато есть звёзды,
 * питание и рейтинг, которых нет у автобусного тура.
 */
export interface ForeignOffer {
  id: string
  status: Status
  sort: number | null
  hotel: string
  stars: number | null
  country: string | null
  city: string | null
  nights: number | null
  meal: MealPlan | null
  /** Дата вылета, ISO без времени */
  date_start: string | null
  /** Оценка гостей, 0–5 */
  rating: number | null
  price: number | null
  /** Цена до скидки. Больше текущей — считаем предложение горящим */
  old_price: number | null
  price_note: string | null
  url: string | null
  image: ImageRef
}

/** Страница «Зарубежные туры»: обвязка вокруг чужого модуля подбора */
export interface ForeignPage {
  id: string
  seo_title: string | null
  seo_description: string | null
  title: string | null
  image: ImageRef
  /** Короткие факты под заголовком, через | */
  facts: string | null
  /** Код партнёрского модуля подбора: разметка и <script> */
  widget_code: string | null
  /** Код модуля «Горящие туры». Заполнен — показываем его вместо своей витрины */
  hot_code: string | null
  hot_title: string | null
  hot_all_url: string | null
  perks_title: string | null
}

/**
 * Юридическая страница: оферта, политика, соглашение. Одной коллекцией, а не
 * страницей на каждую: документы добавляют и переписывают юристы, и заводить
 * под каждый новый свой шаблон — лишняя работа на ровном месте.
 */
export interface LegalDoc {
  id: string
  status: Status
  sort: number | null
  title: string
  slug: string
  /** «Последнее обновление: 20 февраля 2026 г.» */
  note: string | null
  /** Текст документа разметкой */
  body: string | null
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
  departures: Departure[]
  departure_cities: DepartureCity[]
  tours: Tour[]
  tour_days: TourDay[]
  tour_photos: TourPhoto[]
  advantages: Advantage[]
  reviews: Review[]
  review_photos: ReviewPhoto[]
  foreign_page: ForeignPage
  foreign_offers: ForeignOffer[]
  documents: LegalDoc[]
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
  departures: Departure[]
  departureCities: DepartureCity[]
  advantages: Advantage[]
  reviews: Review[]
}
