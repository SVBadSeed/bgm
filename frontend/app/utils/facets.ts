/*
 * Справочники-признаки тура: тип отдыха, размещение, сложность, тип тура,
 * транспорт. Живут одним списком, потому что ведут себя одинаково — поле со
 * значением из словаря, а в фильтрах группа галочек.
 *
 * Порядок этого файла повторён в directus/scripts/seed-schema.mjs: там из тех
 * же пар собираются выпадающие списки в админке. Меняя словарь здесь, поправьте
 * и сидер, иначе в базе появятся значения, которых фильтр не знает.
 */
import type { Tour } from '~/types/schema'

export type FacetKey = 'rest' | 'stay' | 'difficulty' | 'kindOf' | 'transport'

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
    key: 'rest',
    title: 'Тип отдыха',
    field: 'rest_type',
    param: 'otdyh',
    choices: [
      { value: 'ekskursionnyy', label: 'Экскурсионный' },
      { value: 'aktivnyy', label: 'Активный' },
      { value: 'plyazhnyy', label: 'Пляжный' },
      { value: 'gastronomicheskiy', label: 'Гастрономический' },
      { value: 'gornolyzhnyy', label: 'Горнолыжный' },
      { value: 'palomnicheskiy', label: 'Паломнический' },
    ],
  },
  {
    key: 'stay',
    title: 'Тип размещения',
    field: 'stay_type',
    param: 'razmeshchenie',
    choices: [
      { value: 'bez', label: 'Без размещения' },
      { value: 'gostinica', label: 'Гостиница' },
      { value: 'baza', label: 'База отдыха' },
      { value: 'gostevoy-dom', label: 'Гостевой дом' },
      { value: 'sanatoriy', label: 'Санаторий' },
    ],
  },
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
    key: 'kindOf',
    title: 'Тип тура',
    field: 'tour_type',
    param: 'tip_tura',
    choices: [
      { value: 'sbornyy', label: 'Сборный' },
      { value: 'gruppovoy', label: 'Групповой' },
      { value: 'individualnyy', label: 'Индивидуальный' },
      { value: 'avtorskiy', label: 'Авторский' },
    ],
  },
  {
    key: 'transport',
    title: 'Тип транспорта',
    field: 'transport',
    param: 'transport',
    choices: [
      { value: 'avtobus', label: 'Автобус' },
      { value: 'mikroavtobus', label: 'Микроавтобус' },
      { value: 'poezd', label: 'Поезд' },
      { value: 'dzhip', label: 'Джип' },
      { value: 'peshkom', label: 'Пешком' },
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
