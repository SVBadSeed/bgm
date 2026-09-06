/*
 * Даты выездов для карточек и списков.
 *
 * Модель простая: один выезд — одна дата тура. Карточке нужно показать
 * ближайшую дату и намекнуть, что есть другие («12 октября · ещё 4 даты»),
 * поэтому здесь только выборка ближайших и форматирование.
 */
import type { Departure, Tour } from '~/types/schema'

const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

const idOf = (v: string | { id: string } | null): string | null =>
  typeof v === 'string' ? v : (v?.id ?? null)

/** Начало сегодняшнего дня: выезд «сегодня» ещё актуален */
function today(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Выезды одного тура, только будущие, по возрастанию даты */
export function departuresOf(all: Departure[], tour: Tour): Departure[] {
  const from = today()
  return all
    .filter((d) => idOf(d.tour) === tour.id)
    .filter((d) => {
      const t = Date.parse(d.date_start)
      return Number.isFinite(t) && t >= from
    })
    .sort((a, b) => Date.parse(a.date_start) - Date.parse(b.date_start))
}

/** «12 октября», а в другом году — «12 октября 2027» */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const base = `${d.getDate()} ${MONTHS[d.getMonth()]}`
  return d.getFullYear() === new Date().getFullYear()
    ? base
    : `${base} ${d.getFullYear()}`
}

/** «12–14 октября» одной строкой: месяц не повторяем, если он тот же */
export function formatRange(start: string, end: string | null): string {
  if (!end || end === start) return formatDate(start)
  const a = new Date(start)
  const b = new Date(end)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) {
    return formatDate(start)
  }
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()}–${b.getDate()} ${MONTHS[a.getMonth()]}`
  }
  return `${formatDate(start)} — ${formatDate(end)}`
}

/** «ещё 4 даты» / «ещё 1 дата» / «ещё 5 дат» */
export function moreDatesLabel(count: number): string {
  if (count <= 0) return ''
  const last = count % 10
  const teen = count % 100 >= 11 && count % 100 <= 14
  const word = teen || last === 0 || last >= 5 ? 'дат' : last === 1 ? 'дата' : 'даты'
  return `ещё ${count} ${word}`
}

/**
 * Туры, отсортированные по ближайшему выезду. Те, у кого дат нет вовсе,
 * уходят в конец: показывать «Ближайшие» и ставить первым тур без расписания
 * было бы обманом.
 */
export function nearestFirst(tours: Tour[], all: Departure[]): Tour[] {
  const FAR = Number.MAX_SAFE_INTEGER
  const soonest = new Map<string, number>()
  for (const tour of tours) {
    const first = departuresOf(all, tour)[0]
    soonest.set(tour.id, first ? Date.parse(first.date_start) : FAR)
  }
  return [...tours].sort(
    (a, b) => (soonest.get(a.id) ?? FAR) - (soonest.get(b.id) ?? FAR),
  )
}

/** «1 вариант / 2 варианта / 5 вариантов» — числительное по-русски */
export function plural(n: number, one: string, few: string, many: string): string {
  const last = n % 10
  const teen = n % 100 >= 11 && n % 100 <= 14
  if (teen || last === 0 || last >= 5) return many
  return last === 1 ? one : few
}

/** Скидка в процентах, если старая цена задана и она выше текущей */
export function discountPercent(tour: Tour): number | null {
  const old = tour.old_price ?? 0
  const now = tour.price_from ?? 0
  if (!old || !now || old <= now) return null
  return Math.round((1 - now / old) * 100)
}

/** Горящие — те, у кого есть скидка. Ближайшие по дате идут первыми */
export function hotTours(tours: Tour[], departures: Departure[]): Tour[] {
  return nearestFirst(
    tours.filter((t) => discountPercent(t) !== null),
    departures,
  )
}

const MONTHS_NOM = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

/**
 * Месяцы, в которых есть выезды — только те, что реально в продаже.
 * Показывать «Февраль» без единой даты значит вести человека в пустоту.
 */
export function monthsWithDepartures(
  departures: Departure[],
): { value: string; label: string }[] {
  const seen = new Set<string>()
  for (const d of departures) {
    if (Date.parse(d.date_start) >= today()) seen.add(d.date_start.slice(0, 7))
  }
  return [...seen].sort().map((value) => {
    const [y, m] = value.split('-')
    const month = MONTHS_NOM[Number(m) - 1] ?? value
    const sameYear = Number(y) === new Date().getFullYear()
    return { value, label: sameYear ? month : `${month} ${y}` }
  })
}

/** Сколько дней идёт тур — из «3 дня / 2 ночи»; у экскурсии один */
export function daysOf(tour: Tour): number {
  const m = /(\d+)\s*дн/.exec(tour.duration_label ?? '')
  return m ? Number(m[1]) : 1
}

/** Новинка — заведён меньше полутора месяцев назад */
export function isNew(tour: Tour): boolean {
  if (!tour.date_created) return false
  const t = Date.parse(tour.date_created)
  return Number.isFinite(t) && Date.now() - t < 45 * 24 * 60 * 60 * 1000
}
