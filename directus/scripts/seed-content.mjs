/*
 * Демо-контент из прототипа лендинга. Заполняет только ПУСТЫЕ коллекции —
 * повторный запуск ничего не дублирует. Картинки hero берутся из
 * frontend/public/demo и загружаются в Directus как файлы.
 *
 *   pnpm directus:seed:content
 */
import fs from 'node:fs'
import path from 'node:path'
import {
  readItems,
  readSingleton,
  updateSingleton,
  createItems,
  uploadFiles,
  readFolders,
  createFolder,
} from '@directus/sdk'
import { adminClient, waitForDirectus, log, ROOT } from './_client.mjs'

const DEMO_DIR = path.join(ROOT, 'frontend', 'public', 'demo')

async function isEmpty(client, collection) {
  const rows = await client.request(
    readItems(collection, { limit: 1, fields: ['id'] }),
  )
  return rows.length === 0
}

async function ensureFolder(client, name) {
  const found = await client.request(
    readFolders({ filter: { name: { _eq: name } }, limit: 1 }),
  )
  if (found.length) return found[0].id
  const created = await client.request(createFolder({ name }))
  return created.id
}

async function upload(client, folder, fileName, title) {
  const file = path.join(DEMO_DIR, fileName)
  if (!fs.existsSync(file)) return null
  const fd = new FormData()
  fd.append('title', title)
  fd.append('folder', folder)
  fd.append(
    'file',
    new Blob([fs.readFileSync(file)], { type: 'image/webp' }),
    fileName,
  )
  const res = await client.request(uploadFiles(fd))
  return res.id
}

async function main() {
  await waitForDirectus()
  const client = await adminClient()

  // ---- singletons -----------------------------------------------------
  const settings = await client.request(readSingleton('site_settings'))
  if (!settings?.phone) {
    await client.request(
      updateSingleton('site_settings', {
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
        about:
          'Туроператор по югу России и Кавказу. ООО «АТТ», в реестре туроператоров В031-00161-00/04513871.',
        copyright: '© 2026 ООО «АТТ»',
        vk_url: 'https://vk.com/bogematur',
        telegram_url: 'https://t.me/bogematour',
        whatsapp_url: 'https://chat.whatsapp.com/IQpKtr2xYH2La6CFN3MeWw',
        max_url: 'https://max.ru/id9713033679_biz3',
        work_hours: 'Режим работы: ПН–ПТ с 09:00 до 18:00. СБ-ВС — выходной.',
        lk_url: '#',
        favorites_url: '#',
      }),
    )
    log('+ site_settings')
  }

  const folder = await ensureFolder(client, 'Лендинг')

  const landing = await client.request(readSingleton('landing'))
  if (!landing?.hero_title) {
    const promoImage = await upload(
      client,
      folder,
      'promo.webp',
      'Промо-баннер',
    )
    await client.request(
      updateSingleton('landing', {
        seo_title: 'БогемаТур — автобусные туры и экскурсии по югу России',
        seo_description:
          'Экскурсии из Краснодара и многодневные автобусные туры по Кавказу, Крыму и Абхазии. Свои автобусы, посадка по пути, место в салоне на выбор.',
        hero_title: 'Экскурсии {mountains} и туры,\nкоторые помнишь {route} годами',
        hero_search_placeholder: 'Куда поедем?',
        promo_title:
          'Открывайте {loop} новые места собирайте впечатления {paw}',
        promo_button_label: 'Подробнее',
        promo_button_url: '#tours',
        promo_image: promoImage,
        excursions_title: 'Ближайшие туры',
        tours_title: 'Популярные туры',
        destinations_title: 'Популярные направления',
        reviews_title: 'Путешественники о нас',
        reviews_badge: 'Нам доверяют',
        reviews_subtitle:
          'Ваш комфорт — наша работа: стараемся, чтобы каждая поездка была незабываемой!',
        hot_title: 'Горящие туры',
        hot_all_url: '/tury?tip=hot',
        catalog_facts: 'Свои автобусы|Место в салоне на выбор|Работаем с 2011 года',
        why_title: 'Почему выбирают нас',
        lead_title: 'Не нашли, что искали?',
        lead_subtitle: 'Мы перезвоним и ответим на ваши вопросы',
        lead_note:
          'Я согласен на обработку персональных данных и получение рассылок с новостями и спецпредложениями, подтверждая',
        lead_success: 'Заявка принята. Перезвоним в течение 15 минут.',
      }),
    )
    log('+ landing')
  }

  // ---- menu -------------------------------------------------------------
  if (await isEmpty(client, 'menu_items')) {
    /* «Города выезда» и «Направления» без своих подпунктов: списки собираются
       из коллекций departure_cities и destinations. */
    const header = [
      ['Туры', '/tury', true],
      ['Города выезда', '/tury'],
      ['Направления', '#dests'],
      ['Контакты', '#contacts'],
    ]
    const travel = [
      ['Туры', '#tours'],
      ['Экскурсии', '#excursions'],
      ['Направления', '#dests'],
      ['Города посадки', '#'],
      ['Оплата и возврат', '#'],
    ]
    const company = [
      ['О компании', '#why'],
      ['Отзывы', '#revs'],
      ['Агентствам', '#'],
      ['Вакансии', '#'],
      ['Документы', '#'],
    ]
    const legal = [
      ['Пользовательское соглашение', '#'],
      ['Политика конфиденциальности', '#'],
      ['Договор-оферта', '#'],
    ]
    const rows = []
    const push = (placement, list) =>
      list.forEach(([label, url, active], i) =>
        rows.push({
          placement,
          label,
          url,
          active: !!active,
          sort: i + 1,
          status: 'published',
        }),
      )
    push('header', header)
    push('footer_travel', travel)
    push('footer_company', company)
    push('footer_legal', legal)
    await client.request(createItems('menu_items', rows))
    log(`+ menu_items (${rows.length})`)
  }

  // ---- hero -------------------------------------------------------------
  if (await isEmpty(client, 'hero_slides')) {
    const slides = [
      ['Дагестан', '12 программ', 'hero-dag.webp'],
      ['Кабардино-Балкария', '7 программ', 'hero-kbr.webp'],
      ['Крым', '9 программ', 'hero-krm.webp'],
      ['Абхазия', '8 программ', 'hero-abh.webp'],
      ['Краснодарский край', '34 программы', 'hero-kdr.webp'],
    ]
    const rows = []
    for (const [i, [title, subtitle, file]] of slides.entries()) {
      const image = file
        ? await upload(client, folder, file, `Hero — ${title}`)
        : null
      rows.push({
        title,
        subtitle,
        image,
        url: '#dests',
        sort: i + 1,
        status: 'published',
      })
    }
    await client.request(createItems('hero_slides', rows))
    log(`+ hero_slides (${rows.length})`)
  }

  // ---- destinations -------------------------------------------------------
  let destByName = {}
  if (await isEmpty(client, 'destinations')) {
    const list = [
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
      ['Адыгея', 'adygeya', 'Плато и водопады', '9 программ', 12400],
      ['Домбай', 'dombay', 'Канатки и снег', '6 программ', 19800],
      ['Ингушетия', 'ingushetiya', 'Башни в горах', '4 программы', 23100],
      ['Северная Осетия', 'osetiya', 'Город мёртвых', '5 программ', 24300],
      ['Грузия', 'gruziya', 'Застолья и серпантины', '3 программы', 52000],
      ['Архыз', 'arhyz', 'Озёра и обсерватория', '4 программы', 17600],
      [
        'Золотое кольцо',
        'zolotoe-kolco',
        'Русская классика',
        '5 программ',
        48200,
      ],
    ]
    const rows = list.map(
      ([name, slug, kicker, programs_label, price_from], i) => ({
        name,
        slug,
        kicker,
        programs_label,
        price_from,
        url: '#',
        featured: true,
        sort: i + 1,
        status: 'published',
      }),
    )
    const created = await client.request(createItems('destinations', rows))
    created.forEach((d) => (destByName[d.name] = d.id))
    log(`+ destinations (${rows.length})`)
  } else {
    const all = await client.request(
      readItems('destinations', { limit: -1, fields: ['id', 'name'] }),
    )
    all.forEach((d) => (destByName[d.name] = d.id))
  }

  // ---- tours ----------------------------------------------------------------
  let tourByTitle = {}
  if (await isEmpty(client, 'tours')) {
    const excursions = [
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
    ]
    const tours = [
      [
        'Сердце гор: 3 дня в Дагестане и Чеченской Республике',
        'Дагестан',
        'Дагестан',
        '3 дня / 2 ночи',
        24900,
        null,
      ],
      [
        'Цветение лаванды и розы в Крыму: Ай-Петри, Ялта, Форос',
        'Крым',
        'Крым',
        '4 дня / 3 ночи',
        31500,
      ],
      [
        'Эльбрус и Голубые озёра: три дня в Кабардино-Балкарии',
        'Кабардино-Балкария',
        'Кабардино-Балкария',
        '3 дня / 2 ночи',
        22400,
      ],
      [
        'Абхазия за выходные: Рица, Новый Афон и Гагра',
        'Абхазия',
        'Абхазия',
        '2 дня / 1 ночь',
        18700,
      ],
      [
        'Гранд-тур по Золотому кольцу',
        'Золотое кольцо',
        'Золотое кольцо',
        '6 дней / 5 ночей',
        48200,
      ],
    ]
    const rows = []
    excursions.forEach(
      ([title, dest, place_label, duration_label, price_from], i) =>
        rows.push({
          kind: 'excursion',
          title,
          destination: destByName[dest] ?? null,
          place_label,
          duration_label,
          price_from,
          price_prefix: '',
          price_note: 'за человека',
          url: '#',
          featured: true,
          sort: i + 1,
          status: 'published',
        }),
    )
    tours.forEach(
      ([title, dest, place_label, duration_label, price_from, tag], i) =>
        rows.push({
          kind: 'tour',
          title,
          tag: tag ?? null,
          destination: destByName[dest] ?? null,
          place_label,
          duration_label,
          price_from,
          price_prefix: 'от',
          price_note: 'за туриста',
          url: '#',
          featured: true,
          sort: i + 1,
          status: 'published',
        }),
    )
    const created = await client.request(createItems('tours', rows))
    created.forEach((t) => (tourByTitle[t.title] = t.id))
    log(`+ tours (${rows.length})`)
  } else {
    const all = await client.request(
      readItems('tours', { limit: -1, fields: ['id', 'title'] }),
    )
    all.forEach((t) => (tourByTitle[t.title] = t.id))
  }

  // ---- advantages -------------------------------------------------------------
  if (await isEmpty(client, 'advantages')) {
    const rows = [
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
    ].map(([icon, title, text, link_label, link_url], i) => ({
      icon,
      title,
      text,
      link_label,
      link_url,
      page: 'landing',
      sort: i + 1,
      status: 'published',
    }))
    /* Доводы страницы зарубежных туров — та же коллекция, другая страница */
    const foreign = [
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
    ].map(([icon, title, text], i) => ({
      icon,
      title,
      text,
      page: 'foreign',
      sort: rows.length + i + 1,
      status: 'published',
    }))
    await client.request(createItems('advantages', [...rows, ...foreign]))
    log(`+ advantages (${rows.length + foreign.length})`)
  }

  // ---- зарубежные туры ----------------------------------------------------
  const foreignPage = await client.request(readSingleton('foreign_page'))
  if (!foreignPage?.title) {
    await client.request(
      updateSingleton('foreign_page', {
        seo_title: 'Пакетные туры за границу из Краснодара и Сочи — БогемаТур',
        seo_description:
          'Турция, Египет, ОАЭ и Таиланд: отель и перелёт одним пакетом. Подбор, бронирование и оформление документов — на нас.',
        title: 'Пакетные туры за границу',
        facts:
          'Турция, Египет, ОАЭ, Таиланд|Вылеты из Краснодара, Сочи и Минвод|Рассрочка и оплата картой',
        widget_note:
          'Цены обновляются онлайн у туроператоров. Нашли дешевле — скажите менеджеру, проверим.',
        hot_title: 'Горящие предложения',
        perks_title: 'Почему за границу — с нами',
      }),
    )
    log('+ foreign_page')
  }

  if (await isEmpty(client, 'foreign_offers')) {
    /* Даты вылетов считаем от сегодня, чтобы демо не протухло через месяц */
    const inDays = (n) => {
      const d = new Date()
      d.setDate(d.getDate() + n)
      return d.toISOString().slice(0, 10)
    }
    const rows = [
      ['Marine Family Club', 5, 'Турция', 'Сиде', 7, 'uai', 4.6, 65400, 47900, 6],
      ['Beach Safari Resort', 4, 'Египет', 'Марса-Алам', 7, 'ai', 4.4, 50600, 41600, 8],
      ['Citrus Plaza Hotel', 4, 'Турция', 'Аланья', 7, 'ai', 4.2, 55800, 42700, 6],
      ['Rehana Royal Beach', 5, 'Египет', 'Шарм-эль-Шейх', 7, 'uai', 4.5, 78300, 58700, 11],
      ['Marjan Island Resort', 5, 'ОАЭ', 'Рас-эль-Хайма', 6, 'ai', 4.7, 96500, 82300, 13],
      ['Aegean Blue', 4, 'Греция', 'Крит', 8, 'hb', 4.5, 92000, 79400, 15],
      ['Crowne Plaza Deira', 5, 'ОАЭ', 'Дубай', 7, 'ro', 4.6, 0, 71700, 9],
      ['Baumanburi Phuket', 4, 'Таиланд', 'Пхукет', 11, 'bb', 4.3, 0, 75000, 12],
    ].map(
      (
        [hotel, stars, country, city, nights, meal, rating, oldPrice, price, day],
        i,
      ) => ({
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
        sort: i + 1,
        status: 'published',
      }),
    )
    await client.request(createItems('foreign_offers', rows))
    log(`+ foreign_offers (${rows.length})`)
  }

  // ---- reviews ------------------------------------------------------------------
  if (await isEmpty(client, 'reviews')) {
    const rows = [
      [
        'Марина Ковалёва',
        'Краснодар · август 2026',
        'Ехали втроём с ребёнком. Автобус новый, остановки часто, гид Заира знает каждый перевал. На Сулакский каньон встали в пять утра — оно того стоило.',
        'Сердце гор: 3 дня в Дагестане и Чеченской Республике',
      ],
      [
        'Игорь Демидов',
        'Армавир · июль 2026',
        'Брал экскурсию на день, чтобы проверить оператора перед большим туром. Посадка в Армавире ровно по времени из билета, всё по программе.',
        'Абрау-Дюрсо',
      ],
      [
        'Алина Белова',
        'Краснодар · июнь 2026',
        'Места выбрали заранее: меня укачивает, сидели во втором ряду. В Форосе дали больше времени, чем в программе, потому что группа собралась быстро.',
        'Цветение лаванды и розы в Крыму: Ай-Петри, Ялта, Форос',
      ],
    ].map(([author, meta, text, tour], i) => ({
      author,
      meta,
      text,
      rating: 5,
      tour: tourByTitle[tour] ?? null,
      sort: i + 1,
      status: 'published',
    }))
    await client.request(createItems('reviews', rows))
    log(`+ reviews (${rows.length})`)
  }

  log('контент готов')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('[seed] ошибка:', e?.errors ?? e?.message ?? e)
    process.exit(1)
  })
