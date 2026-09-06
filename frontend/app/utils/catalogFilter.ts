/*
 * Фильтрация каталога. Живёт отдельно от страницы, чтобы её могли переиспользовать
 * страницы направлений (там те же правила, только направление задано заранее).
 *
 * Города, направления и месяцы — списки: «из Краснодара или Армавира» человек
 * спрашивает чаще, чем «строго из Краснодара», и выбор одного значения здесь
 * просто список из одного элемента. Пустой список значит «любой».
 *
 * Считается на клиенте по уже загруженным данным: пока туров сотни, это дешевле
 * и отзывчивее, чем ходить в Directus на каждое движение фильтра. Когда список
 * вырастет, сюда встанет серверный запрос — интерфейс останется тем же.
 */
import type { Departure, Tour } from '~/types/schema'
import type { FacetKey } from '~/utils/facets'

export type SortKey = 'date' | 'price-asc' | 'price-desc'
export type LengthKey = '1' | '2' | '3' | 'ot4'

export interface CatalogQuery {
  /** Поиск по названию и направлению */
  q?: string | null
  /** Месяцы выезда в формате YYYY-MM — на телефоне это удобнее двух дат */
  month?: string[] | null
  /** slug'и направлений */
  destination?: string[] | null
  /** slug'и городов отправления */
  city?: string[] | null
  /** Готовые отрезки длительности: '1' | '2' | '3' | 'ot4' */
  length?: LengthKey[] | null
  /** Или своё число дней, если готовые отрезки не подошли */
  daysFrom?: number | null
  daysTo?: number | null
  /** Тип: 'hot' — со скидкой, 'new' — недавно появившиеся */
  type?: 'hot' | 'new' | null
  /** ISO-даты «с» и «по» */
  from?: string | null
  to?: string | null
  priceMin?: number | null
  priceMax?: number | null
  /* Признаки-справочники: ключ группы → выбранные значения. Одной картой, а не
     пятью полями, потому что групп со временем станет больше. */
  facets?: Partial<Record<FacetKey, string[]>> | null
  sort?: SortKey
}

const idOf = (v: unknown): string | null =>
  typeof v === 'string' ? v : ((v as { id?: string })?.id ?? null)

const slugOf = (v: unknown): string | null =>
  typeof v === 'object' && v ? ((v as { slug?: string }).slug ?? null) : null

/** Пустой список — «любой», поэтому его отсутствие и пустота равнозначны */
const list = (v?: string[] | null): string[] => v ?? []

/*
 * Длительность задают двумя способами сразу: галочками готовых отрезков и
 * своим числом дней. Они не спорят, а сужают друг друга — как в форме, где
 * «на выходные» можно уточнить до «ровно 3 дня».
 */
function matchesDays(tour: Tour, q: CatalogQuery): boolean {
  const d = daysOf(tour)
  const buckets = list(q.length)
  if (buckets.length) {
    const hit = buckets.some((b) => (b === 'ot4' ? d >= 4 : d === Number(b)))
    if (!hit) return false
  }
  if (q.daysFrom && d < q.daysFrom) return false
  if (q.daysTo && d > q.daysTo) return false
  return true
}

/* Внутри группы значения складываются по «или», между группами — по «и»:
   «автобус или поезд», но при этом обязательно «лёгкий». */
function matchesFacets(tour: Tour, q: CatalogQuery): boolean {
  const picked = q.facets
  if (!picked) return true
  for (const facet of FACETS) {
    const want = picked[facet.key]
    if (!want?.length) continue
    const value = facetValue(tour, facet)
    if (!value || !want.includes(value)) return false
  }
  return true
}

function matchesType(tour: Tour, type: CatalogQuery['type']): boolean {
  if (!type) return true
  return type === 'hot' ? discountPercent(tour) != null : isNew(tour)
}

/**
 * Выезды тура, подходящие под фильтры дат и городов. Фильтр по городу и датам —
 * это фильтр по расписанию, а не по туру: тур попадает в выдачу, если у него
 * есть хотя бы один подходящий выезд.
 */
export function matchingDepartures(
  tour: Tour,
  departures: Departure[],
  q: CatalogQuery,
  cityIdBySlug: Map<string, string>,
): Departure[] {
  const wantCities = new Set(
    list(q.city)
      .map((slug) => cityIdBySlug.get(slug))
      .filter(Boolean) as string[],
  )
  const wantMonths = new Set(list(q.month))
  const from = q.from ? Date.parse(q.from) : null
  const to = q.to ? Date.parse(q.to) : null

  return departuresOf(departures, tour).filter((d) => {
    if (wantCities.size) {
      const id = idOf(d.city)
      if (!id || !wantCities.has(id)) return false
    }
    /* Месяц сравниваем по строке: дата хранится как YYYY-MM-DD, и разбор
       в Date ради среза лишний, а на границе месяца ещё и рискованный. */
    if (wantMonths.size && !wantMonths.has(d.date_start.slice(0, 7))) {
      return false
    }
    const t = Date.parse(d.date_start)
    if (from && t < from) return false
    if (to && t > to) return false
    return true
  })
}

export interface FilteredTour {
  tour: Tour
  /** Выезды, прошедшие фильтр: из них берётся ближайшая дата на карточке */
  departures: Departure[]
}

export function filterCatalog(
  tours: Tour[],
  departures: Departure[],
  q: CatalogQuery,
  cityIdBySlug: Map<string, string>,
): FilteredTour[] {
  const cities = list(q.city)
  const months = list(q.month)
  const dests = list(q.destination)
  const needSchedule = Boolean(cities.length || months.length || q.from || q.to)

  const needle = (q.q ?? '').trim().toLowerCase()

  const rows = tours
    .filter((tour) => {
      if (needle) {
        const hay = `${tour.title} ${tour.place_label ?? ''}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      if (dests.length) {
        const slug = slugOf(tour.destination)
        if (!slug || !dests.includes(slug)) return false
      }
      if (!matchesDays(tour, q)) return false
      if (!matchesType(tour, q.type)) return false
      if (!matchesFacets(tour, q)) return false
      const price = tour.price_from ?? 0
      if (q.priceMin && price < q.priceMin) return false
      if (q.priceMax && price > q.priceMax) return false
      return true
    })
    .map((tour) => ({
      tour,
      departures: matchingDepartures(tour, departures, q, cityIdBySlug),
    }))
    /* Когда фильтруют по расписанию, тур без подходящих дат в выдаче не нужен:
       человек спрашивает «что есть из Армавира в октябре», а не «что бывает». */
    .filter((row) => !needSchedule || row.departures.length > 0)

  const FAR = Number.MAX_SAFE_INTEGER
  const soonest = (row: FilteredTour) =>
    row.departures[0] ? Date.parse(row.departures[0].date_start) : FAR

  const sorted = [...rows]
  if (q.sort === 'price-asc') {
    sorted.sort((a, b) => (a.tour.price_from ?? 0) - (b.tour.price_from ?? 0))
  } else if (q.sort === 'price-desc') {
    sorted.sort((a, b) => (b.tour.price_from ?? 0) - (a.tour.price_from ?? 0))
  } else {
    sorted.sort((a, b) => soonest(a) - soonest(b))
  }
  return sorted
}
