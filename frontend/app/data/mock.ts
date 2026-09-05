/*
 * Моки = контент прототипа «Лендинг.html». Используются, когда Directus
 * недоступен или NUXT_PUBLIC_USE_MOCK=true. Картинки — из public/demo.
 */
import type {
  Advantage,
  Destination,
  HeroSlide,
  Landing,
  LandingData,
  MenuItem,
  Review,
  SiteSettings,
  Tour,
} from '~/types/schema'

const settings: SiteSettings = {
  id: 'mock',
  brand_name: 'богематур',
  phone: '+7 861 205-40-40',
  phone_href: '+78612054040',
  email: 'info@bogematur.ru',
  address: 'Краснодар, ул. Красная, 176',
  about:
    'Туроператор по югу России и Кавказу. РТО 025467, работаем с 2011 года.',
  copyright: '© 2026 ООО «БогемаТур»',
  vk_url: '#',
  telegram_url: '#',
  whatsapp_url: '#',
  lk_url: '#',
  favorites_url: '#',
}

const landing: Landing = {
  id: 'mock',
  seo_title: 'БогемаТур — автобусные туры и экскурсии по югу России',
  seo_description:
    'Экскурсии из Краснодара и многодневные автобусные туры по Кавказу, Крыму и Абхазии. Свои автобусы, посадка по пути, место в салоне на выбор.',
  seo_image: null,
  hero_title: 'Экскурсии {mountains} и туры,\nкоторые помнишь {route} годами',
  hero_search_placeholder: 'Куда поедем?',
  promo_title:
    'Открывайте {loop} новые места собирайте впечатления {paw}',
  promo_accent: null,
  promo_button_label: 'Подробнее',
  promo_button_url: '#tours',
  promo_image: '/demo/promo.webp',
  mascot_image: '/demo/mascot.webp',
  mascot_full_image: '/demo/mascot-full.webp',
  excursions_title: 'Сейчас в Краснодаре',
  excursions_all_url: '#',
  tours_title: 'Популярные туры',
  tours_all_url: '#',
  destinations_title: 'Популярные направления',
  destinations_all_url: '#',
  reviews_title: 'Путешественники о нас',
  reviews_badge: 'Нам доверяют',
  reviews_subtitle:
    'Ваш комфорт — наша работа: стараемся, чтобы каждая поездка была незабываемой!',
  reviews_all_url: '#',
  why_title: 'Почему выбирают нас',
  lead_title: 'Не нашли, что искали?',
  lead_subtitle: 'Мы перезвоним и ответим на ваши вопросы',
  lead_note:
    'Я согласен на обработку персональных данных и получение рассылок с новостями и спецпредложениями, подтверждая',
  lead_success: 'Заявка принята. Перезвоним в течение 15 минут.',
}

let n = 0
const item = () => ({
  id: `mock-${++n}`,
  status: 'published' as const,
  sort: n,
})

/* Временные болванки из прототипа: без картинок вёрстку не оценить.
   Где регион совпадает с кадром — ставим совпадающий, иначе по кругу. */
const PHOTOS = [
  '/demo/hero-abh.webp',
  '/demo/hero-kbr.webp',
  '/demo/hero-kdr.webp',
  '/demo/hero-krm.webp',
  '/demo/promo.webp',
]
const BY_REGION: Record<string, string> = {
  Абхазия: '/demo/hero-abh.webp',
  'Кабардино-Балкария': '/demo/hero-kbr.webp',
  'Краснодарский край': '/demo/hero-kdr.webp',
  Крым: '/demo/hero-krm.webp',
}
let photoTurn = 0
const photoFor = (region: string) =>
  BY_REGION[region] ?? PHOTOS[photoTurn++ % PHOTOS.length]!

const menuOf = (
  placement: MenuItem['placement'],
  rows: [string, string, boolean?][],
): MenuItem[] =>
  rows.map(([label, url, active]) => ({
    ...item(),
    label,
    url,
    placement,
    active: !!active,
    parent: null,
  }))

/* Пункт шапки со своим выпадающим списком: у детей проставляется parent,
   и шапка сама соберёт из них меню. */
const branch = (
  label: string,
  url: string,
  children: [string, string][],
): MenuItem[] => {
  const head: MenuItem = {
    ...item(),
    label,
    url,
    placement: 'header',
    active: false,
    parent: null,
  }
  return [
    head,
    ...children.map(([childLabel, childUrl]) => ({
      ...item(),
      label: childLabel,
      url: childUrl,
      placement: 'header' as const,
      active: false,
      parent: head.id,
    })),
  ]
}

const menu: MenuItem[] = [
  /* Четыре пункта верхнего уровня: виды туров и заграница — это тоже туры,
     и в строке они читались как свалка. Разделы живут в выпадающих списках. */
  ...branch('Туры', '#tours', [
    ['Экскурсионные туры', '#excursions'],
    ['Туры за границу', '#'],
    ['Однодневные', '#'],
    ['Многодневные', '#'],
    ['Автобусные', '#'],
    ['Для школьников', '#'],
    ['Корпоративные', '#'],
  ]),
  /* У «Направлений» своих детей нет: список берётся из коллекции
     destinations, чтобы не вести одни и те же регионы в двух местах. */
  ...menuOf('header', [['Направления', '#dests']]),
  ...branch('Туристам', '#why', [
    ['О компании', '#'],
    ['Как оплатить', '#'],
    ['Документы', '#'],
    ['Вопросы и ответы', '#'],
    ['Отзывы', '#revs'],
  ]),
  ...menuOf('header', [['🔥 Акции', '#']]),
  ...menuOf('footer_travel', [
    ['Туры', '#tours'],
    ['Экскурсии', '#excursions'],
    ['Направления', '#dests'],
    ['Города посадки', '#'],
    ['Оплата и возврат', '#'],
  ]),
  ...menuOf('footer_company', [
    ['О компании', '#why'],
    ['Отзывы', '#revs'],
    ['Агентствам', '#'],
    ['Вакансии', '#'],
    ['Документы', '#'],
  ]),
  ...menuOf('footer_legal', [
    ['Пользовательское соглашение', '#'],
    ['Политика конфиденциальности', '#'],
    ['Договор-оферта', '#'],
  ]),
]

const heroSlides: HeroSlide[] = (
  [
    ['Дагестан', '12 программ', '/demo/hero-dag.webp'],
    ['Кабардино-Балкария', '7 программ', '/demo/hero-kbr.webp'],
    ['Крым', '9 программ', '/demo/hero-krm.webp'],
    ['Абхазия', '8 программ', '/demo/hero-abh.webp'],
    ['Краснодарский край', '34 программы', '/demo/hero-kdr.webp'],
  ] as [string, string, string | null][]
).map(([title, subtitle, image]) => ({
  ...item(),
  title,
  subtitle,
  image,
  url: '#dests',
}))

const destinations: Destination[] = (
  [
    ['Дагестан', 'dagestan', 'Горы и море', '12 программ', 24900],
    [
      'Краснодарский край',
      'krasnodarskiy-kray',
      'Рядом с домом',
      '34 программы',
      1900,
    ],
    ['Крым', 'krym', 'Лаванда и скалы', '9 программ', 31500],
    ['Кабардино-Балкария', 'kbr', 'Пять тысяч метров', '7 программ', 22400],
    [
      'Чеченская Республика',
      'chechnya',
      'Новая архитектура',
      '6 программ',
      24900,
    ],
    ['Абхазия', 'abkhazia', 'Субтропики', '8 программ', 18700],
    ['Карелия', 'kareliya', 'Север и вода', '4 программы', 39000],
    [
      'Золотое кольцо',
      'zolotoe-kolco',
      'Русская классика',
      '5 программ',
      48200,
    ],
    ['Адыгея', 'adygeya', 'Плато и водопады', '9 программ', 12400],
    ['Домбай', 'dombay', 'Канатки и снег', '6 программ', 19800],
    ['Ингушетия', 'ingushetiya', 'Башни в горах', '4 программы', 23100],
    ['Северная Осетия', 'osetiya', 'Город мёртвых', '5 программ', 24300],
    ['Грузия', 'gruziya', 'Застолья и серпантины', '3 программы', 52000],
    ['Архыз', 'arhyz', 'Озёра и обсерватория', '4 программы', 17600],
  ] as [string, string, string, string, number][]
).map(([name, slug, kicker, programs_label, price_from]) => ({
  ...item(),
  name,
  slug,
  kicker,
  programs_label,
  price_from,
  url: '#',
  image: photoFor(name),
  featured: true,
}))

const dest = (name: string) => destinations.find((d) => d.name === name) ?? null

const excursions: Tour[] = (
  [
    [
      'Абрау-Дюрсо',
      'Краснодарский край',
      'Краснодарский край',
      '9 часов',
      3200,
    ],
    [
      'Краснодар: океанариум, парк Галицкого и прогулка в центре',
      'Краснодарский край',
      'Краснодар',
      '8 часов',
      2400,
    ],
    ['Долина реки Жане', 'Краснодарский край', 'Геленджик', '7 часов', 2700],
    [
      'Путешествие вглубь веков: дольмены',
      'Краснодарский край',
      'Краснодарский край',
      '8 часов',
      2900,
    ],
    [
      'Обзорная историческая экскурсия по Новороссийску',
      'Краснодарский край',
      'Новороссийск',
      '10 часов',
      3400,
    ],
    [
      'Краснодар: парк Галицкого с посещением Японского сада',
      'Краснодарский край',
      'Краснодар',
      '6 часов',
      1900,
    ],
  ] as [string, string, string, string, number][]
).map(([title, d, place_label, duration_label, price_from]) => ({
  ...item(),
  kind: 'excursion' as const,
  title,
  slug: null,
  tag: null,
  destination: dest(d),
  place_label,
  duration_label,
  price_from,
  price_prefix: '',
  price_note: 'за человека',
  url: '#',
  image: photoFor(place_label),
  featured: true,
}))

const tours: Tour[] = (
  [
    [
      'Сердце гор: 3 дня в Дагестане и Чеченской Республике',
      'Дагестан',
      '3 дня / 2 ночи',
      24900,
      'Хит сезона',
    ],
    [
      'Цветение лаванды и розы в Крыму: Ай-Петри, Ялта, Форос',
      'Крым',
      '4 дня / 3 ночи',
      31500,
      null,
    ],
    [
      'Эльбрус и Голубые озёра: три дня в Кабардино-Балкарии',
      'Кабардино-Балкария',
      '3 дня / 2 ночи',
      22400,
      null,
    ],
    [
      'Абхазия за выходные: Рица, Новый Афон и Гагра',
      'Абхазия',
      '2 дня / 1 ночь',
      18700,
      null,
    ],
    [
      'Гранд-тур по Золотому кольцу',
      'Золотое кольцо',
      '6 дней / 5 ночей',
      48200,
      null,
    ],
  ] as [string, string, string, number, string | null][]
).map(([title, d, duration_label, price_from, tag]) => ({
  ...item(),
  kind: 'tour' as const,
  title,
  slug: null,
  tag,
  destination: dest(d),
  place_label: d,
  duration_label,
  price_from,
  price_prefix: 'от',
  price_note: 'за туриста',
  url: '#',
  image: photoFor(d),
  featured: true,
}))

const advantages: Advantage[] = (
  [
    [
      'bus',
      'Свои автобусы',
      'Собственный парк, не подрядчики',
      'О компании',
      '#why',
    ],
    [
      'seat',
      'Место в салоне на выбор',
      'Схема автобуса при бронировании',
      'Как забронировать',
      '#',
    ],
    [
      'pin',
      'Посадка по пути',
      'Краснодар, Армавир, Кропоткин, Тихорецк',
      'Города посадки',
      '#',
    ],
  ] as [Advantage['icon'], string, string, string, string][]
).map(([icon, title, text, link_label, link_url]) => ({
  ...item(),
  icon,
  title,
  text,
  link_label,
  link_url,
}))

const tourRef = (title: string) =>
  [...tours, ...excursions].find((x) => x.title === title) ?? null

const reviews: Review[] = [
  {
    ...item(),
    author: 'Марина Ковалёва',
    meta: 'Краснодар · август 2026',
    rating: 5,
    text: 'Ехали втроём с ребёнком. Автобус новый, остановки часто, гид Заира знает каждый перевал. На Сулакский каньон встали в пять утра — оно того стоило.',
    tour: tourRef('Сердце гор: 3 дня в Дагестане и Чеченской Республике'),
  },
  {
    ...item(),
    author: 'Игорь Демидов',
    meta: 'Армавир · июль 2026',
    rating: 5,
    text: 'Брал экскурсию на день, чтобы проверить оператора перед большим туром. Посадка в Армавире ровно по времени из билета, всё по программе.',
    tour: tourRef('Абрау-Дюрсо'),
  },
  {
    ...item(),
    author: 'Алина Белова',
    meta: 'Краснодар · июнь 2026',
    rating: 5,
    text: 'Места выбрали заранее: меня укачивает, сидели во втором ряду. В Форосе дали больше времени, чем в программе, потому что группа собралась быстро.',
    tour: tourRef('Цветение лаванды и розы в Крыму: Ай-Петри, Ялта, Форос'),
  },
]

export const mockLanding: LandingData = {
  source: 'mock',
  settings,
  landing,
  menu,
  heroSlides,
  excursions,
  tours,
  destinations,
  advantages,
  reviews,
}
