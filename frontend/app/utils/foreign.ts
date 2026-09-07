/*
 * Зарубежные пакетные предложения: словарь питания и мелкая арифметика
 * карточки. Отдельно от facets.ts — там признаки автобусных туров, по
 * которым фильтрует каталог, а здесь свойства отеля, по которым не фильтрует
 * никто: подбором занимается партнёрский модуль.
 *
 * Порядок словаря повторён в directus/scripts/seed-schema.mjs — правим оба
 * места вместе, иначе в базе окажется значение, которого карточка не знает.
 */
import type { ForeignOffer, MealPlan } from '~/types/schema'

export const MEALS: { value: MealPlan; label: string }[] = [
  { value: 'ro', label: 'Без питания' },
  { value: 'bb', label: 'Завтраки' },
  { value: 'hb', label: 'Полупансион' },
  { value: 'fb', label: 'Полный пансион' },
  { value: 'ai', label: 'Всё включено' },
  { value: 'uai', label: 'Ультра всё включено' },
]

export function mealLabel(value: MealPlan | null | undefined): string {
  if (!value) return ''
  return MEALS.find((m) => m.value === value)?.label ?? value
}

/** «7 ночей» — число прямо в подписи, чтобы пилюля читалась одна */
export function nightsLabel(n: number | null | undefined): string {
  if (!n) return ''
  return `${n} ${plural(n, 'ночь', 'ночи', 'ночей')}`
}

/** Размер скидки предложения; null — скидки нет */
export function offerDiscount(offer: ForeignOffer): number | null {
  const old = offer.old_price ?? 0
  const now = offer.price ?? 0
  if (!old || !now || old <= now) return null
  return Math.round((1 - now / old) * 100)
}

/**
 * Порядок в ленте «Горящих»: сначала со скидкой (крупная выше), потом
 * остальные по дате вылета. Предложение без даты уходит в конец — обещать
 * «горящее» и не сказать когда лететь нельзя.
 */
export function hotOffers(offers: ForeignOffer[]): ForeignOffer[] {
  const FAR = Number.MAX_SAFE_INTEGER
  const when = (o: ForeignOffer) => {
    const t = o.date_start ? Date.parse(o.date_start) : NaN
    return Number.isFinite(t) ? t : FAR
  }
  return [...offers].sort((a, b) => {
    const da = offerDiscount(a) ?? 0
    const db = offerDiscount(b) ?? 0
    if (da !== db) return db - da
    return when(a) - when(b)
  })
}
