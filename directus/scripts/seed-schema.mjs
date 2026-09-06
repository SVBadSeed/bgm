/*
 * Схема Directus «как код»: коллекции лендинга + права публичной роли.
 * Идемпотентно: уже существующие коллекции/права пропускаются.
 *
 *   pnpm directus:up && pnpm directus:seed
 *
 * После ручных правок в админке зафиксируй схему в git:
 *   pnpm directus:snapshot   →  directus/schema/snapshot.yaml
 */
import {
  readCollections,
  createCollection,
  createRelation,
  readRelations,
  readPolicies,
  readPermissions,
  createPermission,
  readFieldsByCollection,
  createField,
} from '@directus/sdk'
import { adminClient, waitForDirectus, log, DIRECTUS_URL } from './_client.mjs'

// -------------------------------------------------------------- helpers ----
const ru = (t) => [{ language: 'ru-RU', translation: t }]

const id = () => ({
  field: 'id',
  type: 'uuid',
  meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] },
  schema: { is_primary_key: true, length: 36, has_auto_increment: false },
})

const STATUS_CHOICES = [
  { text: 'Опубликовано', value: 'published', color: '#3FA855' },
  { text: 'Черновик', value: 'draft', color: '#9A9AA4' },
  { text: 'Архив', value: 'archived', color: '#E0322B' },
]
const status = () => ({
  field: 'status',
  type: 'string',
  meta: {
    interface: 'select-dropdown',
    display: 'labels',
    width: 'half',
    options: { choices: STATUS_CHOICES },
    display_options: { showAsDot: true, choices: STATUS_CHOICES },
    translations: ru('Статус'),
  },
  schema: { default_value: 'published', is_nullable: false },
})
const sort = () => ({
  field: 'sort',
  type: 'integer',
  meta: { interface: 'input', hidden: true, width: 'half' },
  schema: {},
})
const dates = () => [
  {
    field: 'date_created',
    type: 'timestamp',
    meta: {
      special: ['date-created'],
      interface: 'datetime',
      readonly: true,
      hidden: true,
      width: 'half',
    },
    schema: {},
  },
  {
    field: 'date_updated',
    type: 'timestamp',
    meta: {
      special: ['date-updated'],
      interface: 'datetime',
      readonly: true,
      hidden: true,
      width: 'half',
    },
    schema: {},
  },
]
const str = (field, label, opts = {}) => ({
  field,
  type: 'string',
  meta: {
    interface: 'input',
    translations: ru(label),
    width: opts.width || 'full',
    note: opts.note,
    options: opts.options,
    required: !!opts.required,
  },
  schema: { max_length: opts.max || 255, default_value: opts.default },
})
const text = (field, label, opts = {}) => ({
  field,
  type: 'text',
  meta: {
    interface: opts.rich ? 'input-rich-text-html' : 'input-multiline',
    translations: ru(label),
    note: opts.note,
  },
  schema: {},
})
const int = (field, label, opts = {}) => ({
  field,
  type: 'integer',
  meta: {
    interface: 'input',
    translations: ru(label),
    width: opts.width || 'half',
    note: opts.note,
    options: { min: opts.min ?? 0 },
  },
  schema: { default_value: opts.default },
})
const bool = (field, label, def = false) => ({
  field,
  type: 'boolean',
  meta: {
    interface: 'boolean',
    translations: ru(label),
    width: 'half',
    special: ['cast-boolean'],
  },
  schema: { default_value: def },
})
const select = (field, label, choices, def) => ({
  field,
  type: 'string',
  meta: {
    interface: 'select-dropdown',
    translations: ru(label),
    width: 'half',
    options: { choices: choices.map(([value, text]) => ({ value, text })) },
  },
  /* Явный null означает «без значения по умолчанию»: у признаков-справочников
     пустое поле — нормальное состояние, а не недозаполненное. */
  schema: { default_value: def === null ? null : (def ?? choices[0][0]) },
})
// файл-картинка: поле + relation к directus_files (relation создаём отдельно ниже)
const image = (field, label, note) => ({
  field,
  type: 'uuid',
  meta: {
    interface: 'file-image',
    special: ['file'],
    translations: ru(label),
    note,
    width: 'full',
  },
  schema: {},
  _relation: { related_collection: 'directus_files' },
})
const date = (field, label, opts = {}) => ({
  field,
  type: 'date',
  meta: {
    interface: 'datetime',
    translations: ru(label),
    width: opts.width || 'half',
    note: opts.note,
    required: opts.required,
  },
  schema: {},
})
const m2o = (field, label, related, template) => ({
  field,
  type: 'uuid',
  meta: {
    interface: 'select-dropdown-m2o',
    special: ['m2o'],
    translations: ru(label),
    width: 'half',
    options: { template },
    display: 'related-values',
    display_options: { template },
  },
  schema: {},
  _relation: { related_collection: related },
})
const listMeta = (icon, label, template, note) => ({
  icon,
  translations: ru(label),
  note,
  sort_field: 'sort',
  archive_field: 'status',
  archive_value: 'archived',
  unarchive_value: 'draft',
  display_template: template,
})

// ---------------------------------------------------------- collections ----
const collections = [
  {
    collection: 'site_settings',
    meta: {
      icon: 'settings',
      singleton: true,
      translations: ru('Настройки сайта'),
      note: 'Контакты, соцсети, юр. строка футера',
    },
    fields: [
      id(),
      str('brand_name', 'Название бренда', {
        default: 'богематур',
        width: 'half',
      }),
      str('phone', 'Телефон', {
        width: 'half',
        note: 'Как показывать: +7 861 205-40-40',
      }),
      str('phone_href', 'Телефон для ссылки tel:', {
        width: 'half',
        note: '+78612054040',
      }),
      str('email', 'E-mail', { width: 'half' }),
      str('address', 'Адрес'),
      text('about', 'О компании (футер)'),
      str('copyright', 'Копирайт', { width: 'half' }),
      str('vk_url', 'ВКонтакте', { width: 'half' }),
      str('telegram_url', 'Telegram', { width: 'half' }),
      str('whatsapp_url', 'WhatsApp', { width: 'half' }),
      str('lk_url', 'Ссылка на личный кабинет', {
        width: 'half',
        note: 'Иконка пользователя в шапке',
      }),
      str('favorites_url', 'Ссылка «Избранное»', { width: 'half' }),
      ...dates(),
    ],
  },
  {
    collection: 'landing',
    meta: {
      icon: 'web',
      singleton: true,
      translations: ru('Лендинг'),
      note: 'Тексты и заголовки главной страницы',
    },
    fields: [
      id(),
      str('seo_title', 'SEO title'),
      text('seo_description', 'SEO description'),
      image('seo_image', 'OG-картинка'),
      text('hero_title', 'Заголовок hero', {
        note: 'Перенос строки = новая строка; лаймовая капля добавляется автоматически',
      }),
      str('hero_search_placeholder', 'Плейсхолдер поиска', {
        default: 'Куда поедем?',
      }),
      str('promo_title', 'Промо: заголовок', {
        note: 'Например: Раннее бронирование на весну —',
      }),
      str('promo_accent', 'Промо: акцент лаймом', {
        note: 'Например: минус 15%',
      }),
      str('promo_button_label', 'Промо: кнопка', {
        width: 'half',
        default: 'Подробнее',
      }),
      str('promo_button_url', 'Промо: ссылка', {
        width: 'half',
        default: '#tours',
      }),
      image('promo_image', 'Промо: картинка'),
      image(
        'mascot_image',
        'Маскот над полкой «Популярные туры»',
        'PNG с прозрачным фоном. Пустое поле — рисуется встроенный вектор.',
      ),
      image(
        'mascot_full_image',
        'Барс в полный рост (сидит на границе футера)',
        'PNG с прозрачным фоном, горизонтальный кадр. Пустое поле — блок не рисуется.',
      ),
      str('excursions_title', 'Заголовок «Экскурсии»', {
        width: 'half',
        default: 'Ближайшие туры',
      }),
      str('excursions_all_url', 'Ссылка «Все» (экскурсии)', {
        width: 'half',
        default: '#',
      }),
      str('tours_title', 'Заголовок «Туры»', {
        width: 'half',
        default: 'Популярные туры',
      }),
      str('tours_all_url', 'Ссылка «Все» (туры)', {
        width: 'half',
        default: '#',
      }),
      str('destinations_title', 'Заголовок «Направления»', {
        width: 'half',
        default: 'Популярные направления',
      }),
      str('destinations_all_url', 'Ссылка «Все» (направления)', {
        width: 'half',
        default: '#',
      }),
      str('reviews_title', 'Заголовок «Отзывы»', {
        width: 'half',
        default: 'Путешественники о нас',
      }),
      str('reviews_badge', 'Бейдж над заголовком «Отзывы»', {
        default: 'Нам доверяют',
      }),
      str('reviews_subtitle', 'Описание под заголовком «Отзывы»', {
        default:
          'Ваш комфорт — наша работа: стараемся, чтобы каждая поездка была незабываемой!',
      }),
      str('reviews_all_url', 'Ссылка «Все отзывы»', {
        width: 'half',
        default: '#',
      }),
      str('hot_title', 'Заголовок «Горящие туры»', {
        width: 'half',
        default: 'Горящие туры',
      }),
      str('hot_all_url', 'Ссылка «Все» (горящие)', {
        width: 'half',
        default: '/tury?tip=hot',
      }),
      str('catalog_facts', 'Плашки в шапке каталога', {
        default: 'Свои автобусы|Место в салоне на выбор|Работаем с 2011 года',
        note: 'Три коротких обещания через | — показываются под заголовком раздела',
      }),
      str('why_title', 'Заголовок «Почему мы»', {
        default: 'Почему выбирают нас',
      }),
      str('lead_title', 'Заголовок формы заявки', {
        default: 'Не нашли, что искали?',
      }),
      str('lead_subtitle', 'Подзаголовок формы заявки', {
        default: 'Мы перезвоним и ответим на ваши вопросы',
      }),
      str('lead_note', 'Текст согласия (перед ссылкой на политику)', {
        default:
          'Я согласен на обработку персональных данных и получение рассылок с новостями и спецпредложениями, подтверждая',
      }),
      str('lead_success', 'Текст после отправки заявки', {
        default: 'Заявка принята. Перезвоним в течение 15 минут.',
      }),
      ...dates(),
    ],
  },
  {
    collection: 'menu_items',
    meta: listMeta('menu', 'Пункты меню', '{{label}}'),
    fields: [
      id(),
      status(),
      sort(),
      str('label', 'Текст', { width: 'half', required: true }),
      str('url', 'Ссылка', { width: 'half', required: true }),
      m2o('parent', 'Родительский пункт', 'menu_items', '{{label}}'),
      select('placement', 'Где показывать', [
        ['header', 'Шапка'],
        ['footer_travel', 'Футер: путешественникам'],
        ['footer_company', 'Футер: компания'],
        ['footer_legal', 'Футер: документы'],
      ]),
      bool('active', 'Подсветить как активный'),
    ],
  },
  {
    collection: 'hero_slides',
    meta: listMeta('photo_library', 'Слайды hero', '{{title}}'),
    fields: [
      id(),
      status(),
      sort(),
      image('image', 'Фото', 'Горизонтальное, не меньше 1600px по ширине'),
      str('title', 'Регион', {
        width: 'half',
        required: true,
        note: 'Дагестан',
      }),
      str('subtitle', 'Подпись', { width: 'half', note: '12 программ' }),
      str('url', 'Куда ведёт', { width: 'half', default: '#dests' }),
      ...dates(),
    ],
  },
  {
    collection: 'destinations',
    meta: listMeta('map', 'Направления', '{{name}}'),
    fields: [
      id(),
      status(),
      sort(),
      str('name', 'Название', { width: 'half', required: true }),
      str('slug', 'Слаг', { width: 'half', options: { slug: true } }),
      str('case_accusative', 'Название в винительном', {
        width: 'half',
        note: 'Для заголовка «Туры в …». Пусто — склоняем сами, заполнять только если склонилось неверно',
      }),
      str('kicker', 'Подзаголовок', { width: 'half', note: 'Горы и море' }),
      str('programs_label', 'Подпись «N программ»', { width: 'half' }),
      int('price_from', 'Цена от, ₽'),
      str('url', 'Ссылка', {
        width: 'half',
        note: 'Пусто — ведёт на /napravleniya/<слаг>',
      }),
      image('image', 'Фото'),
      bool('featured', 'Показывать на главной', true),
      ...dates(),
    ],
  },
  {
    collection: 'tours',
    meta: listMeta(
      'directions_bus',
      'Туры и экскурсии',
      '{{title}}',
      'Витрина на лендинге. Источник правды по продукту — bogema-backend; здесь только карточки.',
    ),
    fields: [
      id(),
      status(),
      sort(),
      select('kind', 'Формат', [
        ['excursion', 'Экскурсия (один день)'],
        ['tour', 'Многодневный тур'],
      ]),
      str('title', 'Название', { required: true }),
      str('slug', 'Слаг', { width: 'half', options: { slug: true } }),
      str('tag', 'Бейдж на фото', { width: 'half', note: 'Например: Новый маршрут' }),
      m2o('destination', 'Направление', 'destinations', '{{name}}'),
      str('place_label', 'Место (мета)', {
        width: 'half',
        note: 'Краснодар / Дагестан',
      }),
      str('duration_label', 'Длительность', {
        width: 'half',
        note: '9 часов / 3 дня / 2 ночи',
      }),
      int('price_from', 'Цена, ₽'),
      /* Признаки-справочники для фильтров каталога. Словарь повторён в
         frontend/app/utils/facets.ts — правим оба места вместе. */
      select(
        'rest_type',
        'Тип отдыха',
        [
          ['ekskursionnyy', 'Экскурсионный'],
          ['aktivnyy', 'Активный'],
          ['plyazhnyy', 'Пляжный'],
          ['gastronomicheskiy', 'Гастрономический'],
          ['gornolyzhnyy', 'Горнолыжный'],
          ['palomnicheskiy', 'Паломнический'],
        ],
        null,
      ),
      select(
        'stay_type',
        'Тип размещения',
        [
          ['bez', 'Без размещения'],
          ['gostinica', 'Гостиница'],
          ['baza', 'База отдыха'],
          ['gostevoy-dom', 'Гостевой дом'],
          ['sanatoriy', 'Санаторий'],
        ],
        null,
      ),
      select(
        'difficulty',
        'Уровень сложности',
        [
          ['legkiy', 'Лёгкий'],
          ['sredniy', 'Средний'],
          ['slozhnyy', 'Сложный'],
        ],
        null,
      ),
      select(
        'tour_type',
        'Тип тура',
        [
          ['sbornyy', 'Сборный'],
          ['gruppovoy', 'Групповой'],
          ['individualnyy', 'Индивидуальный'],
          ['avtorskiy', 'Авторский'],
        ],
        null,
      ),
      select(
        'transport',
        'Тип транспорта',
        [
          ['avtobus', 'Автобус'],
          ['mikroavtobus', 'Микроавтобус'],
          ['poezd', 'Поезд'],
          ['dzhip', 'Джип'],
          ['peshkom', 'Пешком'],
        ],
        null,
      ),
      int('old_price', 'Цена до скидки, ₽', {
        note: 'Заполнено и больше обычной цены — тур попадает в «Горящие»',
      }),
      str('price_prefix', 'Префикс цены', {
        width: 'half',
        note: '«от» для туров, пусто для экскурсий',
      }),
      str('price_note', 'Подпись к цене', {
        width: 'half',
        default: 'за человека',
      }),
      str('url', 'Ссылка', { width: 'half', default: '#' }),
      image('image', 'Фото'),
      bool('featured', 'Показывать на главной', true),
      ...dates(),
    ],
  },
  {
    collection: 'departure_cities',
    meta: listMeta(
      'departure_board',
      'Города выезда',
      '{{name}}',
      'Откуда уходит автобус. На них ссылаются выезды и фильтр каталога.',
    ),
    fields: [
      id(),
      status(),
      sort(),
      str('name', 'Город', { width: 'half', required: true }),
      str('slug', 'Слаг', { width: 'half', options: { slug: true } }),
      str('case_genitive', 'Название в родительном', {
        width: 'half',
        note: 'Для заголовка «Туры из …». Пусто — склоняем сами, заполнять только если склонилось неверно',
      }),
      str('pickup_note', 'Место и время подачи', {
        note: 'ул. Красная, 176 · 5:30 — показывается на странице тура',
      }),
      ...dates(),
    ],
  },
  {
    collection: 'departures',
    meta: listMeta(
      'event',
      'Выезды',
      '{{tour.title}} — {{date_start}}',
      'Один выезд = одна дата тура. Отсюда берутся даты на карточках, сортировка «Ближайшие» и фильтр по городу выезда.',
    ),
    fields: [
      id(),
      status(),
      sort(),
      m2o('tour', 'Тур', 'tours', '{{title}}'),
      date('date_start', 'Дата выезда', { required: true }),
      date('date_end', 'Дата возвращения', {
        note: 'Для однодневных можно оставить пустым',
      }),
      m2o('city', 'Город выезда', 'departure_cities', '{{name}}'),
      int('seats_left', 'Свободных мест', {
        note: 'Пусто — не показываем счётчик',
      }),
      int('price', 'Цена этой даты, ₽', {
        note: 'Пусто — берётся цена тура. Заполняется, когда сезон дороже',
      }),
      ...dates(),
    ],
  },
  {
    collection: 'advantages',
    meta: listMeta('verified', 'Почему мы', '{{title}}'),
    fields: [
      id(),
      status(),
      sort(),
      select('icon', 'Иконка', [
        ['bus', 'Автобус'],
        ['seat', 'Место в салоне'],
        ['pin', 'Геометка'],
        ['shield', 'Щит'],
        ['star', 'Звезда'],
      ]),
      str('title', 'Заголовок', { width: 'half', required: true }),
      str('text', 'Строка под заголовком', { width: 'half' }),
      str('link_label', 'Текст ссылки', { width: 'half' }),
      str('link_url', 'Ссылка', { width: 'half', default: '#' }),
    ],
  },
  {
    collection: 'reviews',
    meta: listMeta('reviews', 'Отзывы', '{{author}}'),
    fields: [
      id(),
      status(),
      sort(),
      str('author', 'Автор', { width: 'half', required: true }),
      str('meta', 'Город · дата', {
        width: 'half',
        note: 'Краснодар · август 2026',
      }),
      int('rating', 'Оценка (1–5)', { default: 5, min: 1 }),
      text('text', 'Текст отзыва'),
      m2o('tour', 'Тур', 'tours', '{{title}}'),
      ...dates(),
    ],
  },
  {
    collection: 'subscribers',
    meta: {
      icon: 'mail',
      translations: ru('Подписчики'),
      note: 'Форма «Пришлём ближайшие выезды»',
      display_template: '{{email}}',
    },
    fields: [
      id(),
      str('email', 'E-mail', { width: 'half', required: true }),
      str('source', 'Источник', { width: 'half', default: 'landing' }),
      ...dates(),
    ],
  },
  {
    collection: 'leads',
    meta: {
      icon: 'contact_phone',
      translations: ru('Заявки'),
      display_template: '{{name}} {{phone}}',
    },
    fields: [
      id(),
      select('status', 'Статус', [
        ['new', 'Новая'],
        ['in_progress', 'В работе'],
        ['done', 'Закрыта'],
      ]),
      str('name', 'Имя', { width: 'half' }),
      str('phone', 'Телефон', { width: 'half' }),
      str('email', 'E-mail', { width: 'half' }),
      str('source', 'Источник', { width: 'half', default: 'landing' }),
      text('message', 'Сообщение'),
      ...dates(),
    ],
  },
]

// --------------------------------------------------------- permissions ----
const PUBLIC_POLICY_ID = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17'
const published = { status: { _eq: 'published' } }
const publicPermissions = [
  { collection: 'directus_files', action: 'read', fields: ['*'] },
  { collection: 'site_settings', action: 'read', fields: ['*'] },
  { collection: 'landing', action: 'read', fields: ['*'] },
  {
    collection: 'menu_items',
    action: 'read',
    fields: ['*'],
    permissions: published,
  },
  {
    collection: 'departure_cities',
    action: 'read',
    fields: ['*'],
    permissions: published,
  },
  {
    collection: 'departures',
    action: 'read',
    fields: ['*'],
    permissions: published,
  },
  {
    collection: 'hero_slides',
    action: 'read',
    fields: ['*'],
    permissions: published,
  },
  {
    collection: 'destinations',
    action: 'read',
    fields: ['*'],
    permissions: published,
  },
  {
    collection: 'tours',
    action: 'read',
    fields: ['*'],
    permissions: published,
  },
  {
    collection: 'departure_cities',
    meta: listMeta(
      'departure_board',
      'Города выезда',
      '{{name}}',
      'Откуда уходит автобус. На них ссылаются выезды и фильтр каталога.',
    ),
    fields: [
      id(),
      status(),
      sort(),
      str('name', 'Город', { width: 'half', required: true }),
      str('slug', 'Слаг', { width: 'half', options: { slug: true } }),
      str('case_genitive', 'Название в родительном', {
        width: 'half',
        note: 'Для заголовка «Туры из …». Пусто — склоняем сами, заполнять только если склонилось неверно',
      }),
      str('pickup_note', 'Место и время подачи', {
        note: 'ул. Красная, 176 · 5:30 — показывается на странице тура',
      }),
      ...dates(),
    ],
  },
  {
    collection: 'departures',
    meta: listMeta(
      'event',
      'Выезды',
      '{{tour.title}} — {{date_start}}',
      'Один выезд = одна дата тура. Отсюда берутся даты на карточках, сортировка «Ближайшие» и фильтр по городу выезда.',
    ),
    fields: [
      id(),
      status(),
      sort(),
      m2o('tour', 'Тур', 'tours', '{{title}}'),
      date('date_start', 'Дата выезда', { required: true }),
      date('date_end', 'Дата возвращения', {
        note: 'Для однодневных можно оставить пустым',
      }),
      m2o('city', 'Город выезда', 'departure_cities', '{{name}}'),
      int('seats_left', 'Свободных мест', {
        note: 'Пусто — не показываем счётчик',
      }),
      int('price', 'Цена этой даты, ₽', {
        note: 'Пусто — берётся цена тура. Заполняется, когда сезон дороже',
      }),
      ...dates(),
    ],
  },
  {
    collection: 'advantages',
    action: 'read',
    fields: ['*'],
    permissions: published,
  },
  {
    collection: 'reviews',
    action: 'read',
    fields: ['*'],
    permissions: published,
  },
  { collection: 'subscribers', action: 'create', fields: ['email', 'source'] },
  {
    collection: 'leads',
    action: 'create',
    fields: ['name', 'phone', 'email', 'message', 'source'],
  },
]

// ------------------------------------------------------------------ run ----
async function main() {
  await waitForDirectus()
  const client = await adminClient()

  const existing = new Set(
    (await client.request(readCollections())).map((c) => c.collection),
  )
  const pendingRelations = []

  for (const def of collections) {
    const fields = def.fields.map(({ _relation, ...f }) => {
      if (_relation) {
        pendingRelations.push({
          collection: def.collection,
          field: f.field,
          ..._relation,
        })
      }
      return f
    })
    if (existing.has(def.collection)) {
      // Коллекция есть — досоздаём только поля, которых в ней ещё нет.
      // Так сид остаётся идемпотентным и переносит новые поля на боевой стенд.
      const have = new Set(
        (await client.request(readFieldsByCollection(def.collection))).map(
          (f) => f.field,
        ),
      )
      const missing = fields.filter((f) => !have.has(f.field))
      for (const f of missing) {
        await client.request(createField(def.collection, f))
        log(`+ поле ${def.collection}.${f.field}`)
      }
      if (!missing.length) log(`= ${def.collection} без изменений`)
      continue
    }
    await client.request(
      createCollection({
        collection: def.collection,
        meta: def.meta,
        schema: {},
        fields,
      }),
    )
    log(`+ коллекция ${def.collection} (${fields.length} полей)`)
  }

  const relations = await client.request(readRelations())
  const hasRel = (c, f) =>
    relations.some((r) => r.collection === c && r.field === f)
  for (const r of pendingRelations) {
    if (hasRel(r.collection, r.field)) continue
    await client.request(
      createRelation({
        collection: r.collection,
        field: r.field,
        related_collection: r.related_collection,
        meta: {
          one_field: null,
          sort_field: null,
          one_deselect_action: 'nullify',
        },
        schema: { on_delete: 'SET NULL' },
      }),
    )
    log(`+ связь ${r.collection}.${r.field} → ${r.related_collection}`)
  }

  let policies = await client.request(
    readPolicies({ filter: { id: { _eq: PUBLIC_POLICY_ID } }, limit: 1 }),
  )
  if (!policies.length) {
    policies = (await client.request(readPolicies({ limit: -1 }))).filter(
      (p) => p.name === '$t:public_label',
    )
  }
  const publicPolicy = policies[0]
  if (!publicPolicy) {
    throw new Error(
      'Не нашёл публичную policy — проверь версию Directus (нужна 11.x)',
    )
  }

  const current = await client.request(
    readPermissions({
      filter: { policy: { _eq: publicPolicy.id } },
      limit: -1,
    }),
  )
  for (const p of publicPermissions) {
    if (
      current.some(
        (c) => c.collection === p.collection && c.action === p.action,
      )
    )
      continue
    await client.request(
      createPermission({
        policy: publicPolicy.id,
        collection: p.collection,
        action: p.action,
        fields: p.fields,
        permissions: p.permissions ?? {},
        validation: {},
        presets: null,
      }),
    )
    log(`+ право public: ${p.action} ${p.collection}`)
  }

  log('готово. Админка: ' + DIRECTUS_URL)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('[seed] ошибка:', e?.errors ?? e?.message ?? e)
    process.exit(1)
  })
