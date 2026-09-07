/*
 * Моки = контент прототипа «Лендинг.html». Используются, когда Directus
 * недоступен или NUXT_PUBLIC_USE_MOCK=true. Картинки — из public/demo.
 */
import type {
  Departure,
  DepartureCity,
  Advantage,
  Destination,
  ForeignOffer,
  ForeignPage,
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
  phone: '8 (800) 777-76-77',
  phone_href: 'tel:88007777677',
  phone_kicker: 'Номер для бесплатных звонков только из России',
  phone_note:
    'Отвечаем на звонки ежедневно с 09:00 до 21:00. Вы в дороге ночью и у Вас срочный вопрос? Наберите этот номер и нажмите 0.',
  phone2: '+7 (918) 494-04-45',
  phone2_href: 'tel:+79184940445',
  phone2_note:
    'На данном номере у нас WhatsApp, Telegram, Max. Пишите в любое время!',
  email: 'info@bogema.ru',
  office_title: 'Офис в г. Новороссийск',
  address:
    'ул. Новороссийской Республики 14А, 2 этаж, офис 13 (БЦ «Венеция»)',
  work_hours: 'Режим работы: ПН–ПТ с 09:00 до 18:00. СБ-ВС — выходной.',
  about:
    'Туроператор по югу России и Кавказу. ООО «АТТ», в реестре туроператоров В031-00161-00/04513871.',
  copyright: '© 2026 ООО «АТТ»',
  vk_url: 'https://vk.com/bogematur',
  telegram_url: 'https://t.me/bogematour',
  whatsapp_url: 'https://chat.whatsapp.com/IQpKtr2xYH2La6CFN3MeWw',
  max_url: 'https://max.ru/id9713033679_biz3',
  map_url: '',
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
  promo_button_url: '/tury',
  promo_image: '/demo/promo.webp',
  mascot_image: '/demo/mascot.webp',
  mascot_full_image: '/demo/mascot-full.webp',
  excursions_title: 'Ближайшие туры',
  excursions_all_url: '/tury',
  tours_title: 'Популярные туры',
  tours_all_url: '/tury',
  destinations_title: 'Популярные направления',
  destinations_all_url: '/tury',
  reviews_title: 'Путешественники о нас',
  reviews_badge: 'Нам доверяют',
  reviews_subtitle:
    'Ваш комфорт — наша работа: стараемся, чтобы каждая поездка была незабываемой!',
  reviews_all_url: '#',
  hot_title: 'Горящие туры',
  hot_all_url: '/tury?tip=hot',
  catalog_facts: 'Свои автобусы|Место в салоне на выбор|Работаем с 2011 года',
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

/* Дата создания «N дней назад» — чтобы фильтр «Новые» было чем проверить */
const createdAgo = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

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
  ...branch('Туры', '/tury', [
    ['Все туры и экскурсии', '/tury'],
    ['Однодневные', '/tury?dlitelnost=1'],
    ['На выходные', '/tury?dlitelnost=2'],
    ['От 4 дней', '/tury?dlitelnost=ot4'],
    ['Горящие', '/tury?tip=hot'],
    ['Туры за границу', '/zarubezhnye-tury'],
    ['Корпоративные', '/tury'],
  ]),
  /* У «Городов выезда» и «Направлений» своих детей нет: списки берутся из
     коллекций, чтобы не вести одни и те же города и регионы в двух местах. */
  ...menuOf('header', [['Города выезда', '/tury']]),
  ...menuOf('header', [['Направления', '#dests']]),
  /* «Контакты» открывают окно поверх страницы: ссылку перехватывает
     ContactsDialog, отдельной страницы под них нет. */
  ...menuOf('header', [['Контакты', '#contacts']]),
  ...menuOf('footer_travel', [
    ['Туры', '/tury'],
    ['Экскурсии', '/tury?dlitelnost=1'],
    ['Направления', '#dests'],
    ['Города посадки', '#dests'],
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

const departureCities: DepartureCity[] = (
  [
    ['Краснодар', 'krasnodar', 'ул. Красная, 176 · подача за 20 минут'],
    ['Армавир', 'armavir', 'ул. Кирова, 45 · подача за 15 минут'],
    ['Кропоткин', 'kropotkin', 'привокзальная площадь'],
    ['Тихорецк', 'tihoreck', 'ул. Меньшикова, 12'],
  ] as [string, string, string][]
).map(([name, slug, pickup_note]) => ({
  ...item(),
  name,
  slug,
  case_genitive: null,
  pickup_note,
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
  case_accusative: null,
  kicker,
  programs_label,
  price_from,
  url: `/napravleniya/${slug}`,
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
).map(([title, d, place_label, duration_label, price_from], i) => ({
  ...item(),
  kind: 'excursion' as const,
  title,
  slug: null,
  tag: null,
  destination: dest(d),
  place_label,
  duration_label,
  price_from,
  /* Скидка у части позиций — иначе блок «Горящие» нечем наполнить */
  old_price: i % 3 === 1 ? Math.round((price_from * 1.25) / 100) * 100 : null,
  date_created: createdAgo(i * 17),
  /* Признаки перебираем по кругу: моки нужны, чтобы в фильтрах было что
     выбирать, а не чтобы описать реальные программы. */
  difficulty: i % 4 === 3 ? 'sredniy' : 'legkiy',
  transport: 'avtobus',
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
      null,
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
).map(([title, d, duration_label, price_from, tag], i) => ({
  ...item(),
  kind: 'tour' as const,
  title,
  slug: null,
  tag,
  destination: dest(d),
  place_label: d,
  duration_label,
  price_from,
  old_price: i % 2 === 0 ? Math.round((price_from * 1.18) / 100) * 100 : null,
  date_created: createdAgo(i * 23),
  difficulty: ['legkiy', 'sredniy', 'slozhnyy'][i % 3] ?? null,
  transport: ['avtobus', 'poezd', 'samolet'][i % 3] ?? null,
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
  page: 'landing' as const,
}))

/* Преимущества страницы зарубежных туров. Та же коллекция, что и на главной,
   отличается только полем «страница»: блок один, вести его в двух местах
   менеджеру незачем. Тексты длиннее — за границу едут дороже и вопросов
   задают больше. */
const foreignPerks: Advantage[] = (
  [
    [
      'headset',
      'Профессиональные менеджеры',
      'Подберём тур под ваши даты, бюджет и пожелания: сравним операторов, проверим отели и предложим варианты, из которых останется только выбрать.',
    ],
    [
      'shield',
      'Всё оформление на нас',
      'Договор, страховка, ваучеры и билеты — готовим сами. Вы получаете пакет документов и телефон, по которому отвечают в поездке.',
    ],
    [
      'diamond',
      'Условия, которых нет в поиске',
      'Раннее бронирование, места у моря, трансфер и индивидуальные экскурсии — договариваемся напрямую с принимающей стороной.',
    ],
  ] as [Advantage['icon'], string, string][]
).map(([icon, title, text]) => ({
  ...item(),
  icon,
  title,
  text,
  link_label: null,
  link_url: null,
  page: 'foreign' as const,
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

/*
 * Демо-расписание: у каждого тура несколько дат вперёд от сегодняшнего дня,
 * с шагом в неделю-полторы и разными городами выезда. Даты считаются
 * относительно «сейчас», иначе моки протухают через месяц и карточки
 * остаются без ближайшего выезда.
 */
const departures: Departure[] = (() => {
  const rows: Departure[] = []
  const base = new Date()
  base.setHours(0, 0, 0, 0)

  const iso = (d: Date) => d.toISOString().slice(0, 10)
  const plus = (days: number) => {
    const d = new Date(base)
    d.setDate(d.getDate() + days)
    return d
  }
  /* Сколько дней длится тур — вытаскиваем из «3 дня / 2 ночи» */
  const daysOf = (tour: Tour) => {
    const m = /(\d+)\s*дн/.exec(tour.duration_label ?? '')
    return m ? Math.max(0, Number(m[1]) - 1) : 0
  }

  const all: Tour[] = [...excursions, ...tours]
  all.forEach((tour, ti) => {
    const span = daysOf(tour)
    const step = tour.kind === 'excursion' ? 4 : 11
    const count = tour.kind === 'excursion' ? 6 : 5
    for (let i = 0; i < count; i++) {
      const start = plus(3 + ti * 2 + i * step)
      const end = span ? plus(3 + ti * 2 + i * step + span) : null
      rows.push({
        ...item(),
        tour: tour.id,
        date_start: iso(start),
        date_end: end ? iso(end) : null,
        city: departureCities[(ti + i) % departureCities.length]!.id,
        seats_left: i === 0 ? 4 + ((ti * 3 + i) % 12) : null,
        price: null,
      })
    }
  })
  return rows
})()

/* ---------------------------------------------------------------- заграница */

/* Даты вылетов считаем от сегодня: демо не должно протухать через месяц */
const inDays = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export const mockForeignPage: ForeignPage = {
  id: 'mock',
  seo_title: 'Пакетные туры за границу из Краснодара и Сочи — БогемаТур',
  seo_description:
    'Турция, Египет, ОАЭ и Таиланд: отель и перелёт одним пакетом. Подбор, бронирование и оформление документов — на нас.',
  title: 'Пакетные туры за границу',
  image: '/demo/afiny.jpg',
  facts:
    'Турция, Египет, ОАЭ, Таиланд|Вылеты из Краснодара, Сочи и Минвод|Рассрочка и оплата картой',
  widget_code: '',
  widget_note:
    'Цены обновляются онлайн у туроператоров. Нашли дешевле — скажите менеджеру, проверим.',
  hot_title: 'Горящие предложения',
  hot_all_url: '',
  perks_title: 'Почему за границу — с нами',
}

export const mockForeignOffers: ForeignOffer[] = (
  [
    ['Marine Family Club', 5, 'Турция', 'Сиде', 7, 'uai', 4.6, 65400, 47900, 6],
    ['Beach Safari Resort', 4, 'Египет', 'Марса-Алам', 7, 'ai', 4.4, 50600, 41600, 8],
    ['Citrus Plaza Hotel', 4, 'Турция', 'Аланья', 7, 'ai', 4.2, 55800, 42700, 6],
    ['Rehana Royal Beach', 5, 'Египет', 'Шарм-эль-Шейх', 7, 'uai', 4.5, 78300, 58700, 11],
    ['Marjan Island Resort', 5, 'ОАЭ', 'Рас-эль-Хайма', 6, 'ai', 4.7, 96500, 82300, 13],
    ['Aegean Blue', 4, 'Греция', 'Крит', 8, 'hb', 4.5, 92000, 79400, 15],
    ['Crowne Plaza Deira', 5, 'ОАЭ', 'Дубай', 7, 'ro', 4.6, 0, 71700, 9],
    ['Baumanburi Phuket', 4, 'Таиланд', 'Пхукет', 11, 'bb', 4.3, 0, 75000, 12],
  ] as [string, number, string, string, number, ForeignOffer['meal'], number, number, number, number][]
).map(
  ([hotel, stars, country, city, nights, meal, rating, oldPrice, price, day]) => ({
    ...item(),
    hotel,
    stars,
    country,
    city,
    nights,
    meal,
    rating,
    old_price: oldPrice || null,
    price,
    price_note: 'за двоих',
    date_start: inDays(day),
    url: '#',
    image: '/demo/sfinks.jpg',
  }),
)

export const mockLanding: LandingData = {
  source: 'mock',
  settings,
  landing,
  menu,
  heroSlides,
  excursions,
  tours,
  destinations,
  departures,
  departureCities,
  advantages: [...advantages, ...foreignPerks],
  reviews,
}
