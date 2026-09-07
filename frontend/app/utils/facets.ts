/*
 * Справочники-признаки тура: уровень сложности и транспорт. Живут одним
 * списком, потому что ведут себя одинаково — поле со значением из словаря,
 * а в фильтрах группа галочек. Добавить новый признак — дописать сюда пункт
 * и завести такое же поле в сидере.
 *
 * Порядок этого файла повторён в directus/scripts/seed-schema.mjs: там из тех
 * же пар собираются выпадающие списки в админке. Меняя словарь здесь, поправьте
 * и сидер, иначе в базе появятся значения, которых фильтр не знает.
 */
import type { Tour } from '~/types/schema'

export type FacetKey = 'difficulty' | 'transport'

export interface Facet {
  key: FacetKey
  /** Заголовок группы в фильтрах */
  title: string
  /** Поле тура */
  field: keyof Tour
  /** Ключ в адресе страницы */
  param: string
  choices: { value: string; label: string }[]
}

export const FACETS: Facet[] = [
  {
    key: 'difficulty',
    title: 'Уровень сложности',
    field: 'difficulty',
    param: 'slozhnost',
    choices: [
      { value: 'legkiy', label: 'Лёгкий' },
      { value: 'sredniy', label: 'Средний' },
      { value: 'slozhnyy', label: 'Сложный' },
    ],
  },
  {
    key: 'transport',
    title: 'Тип транспорта',
    field: 'transport',
    param: 'transport',
    choices: [
      { value: 'avtobus', label: 'Автобус' },
      { value: 'poezd', label: 'Поезд' },
      { value: 'samolet', label: 'Самолёт' },
    ],
  },
]

/** Значение признака у тура; пусто — признак не заполнен */
export function facetValue(tour: Tour, facet: Facet): string | null {
  const v = tour[facet.field]
  return typeof v === 'string' && v ? v : null
}

export function facetLabel(facet: Facet, value: string): string {
  return facet.choices.find((c) => c.value === value)?.label ?? value
}
