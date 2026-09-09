import { readItems } from '@directus/sdk'
import { mockLanding } from '~/data/mock'
import type {
  Departure,
  DepartureCity,
  Destination,
  Tour,
} from '~/types/schema'

/**
 * Каталог: все туры в продаже, а не только витрина главной.
 *
 * Отдельно от useLanding намеренно — там выборка ограничена featured, и
 * подмешивать в неё полный список значит тянуть его на каждую страницу.
 * Здесь же выездов и направлений ровно столько, сколько нужно фильтрам.
 */
export interface CatalogData {
  source: 'directus' | 'mock'
  tours: Tour[]
  departures: Departure[]
  destinations: Destination[]
  cities: DepartureCity[]
}

const published = { status: { _eq: 'published' } } as const

async function fetchCatalog(): Promise<CatalogData> {
  const client = useDirectus()

  const [tours, departures, destinations, cities] = await Promise.all([
    client.request(
      readItems('tours', {
        filter: published,
        sort: ['sort'],
        limit: -1,
        fields: ['*', { destination: ['id', 'name', 'slug'] }],
      }),
    ),
    client.request(
      readItems('departures', {
        filter: {
          ...published,
          /* Только будущие: прошедшие даты каталогу не нужны, а архив
             расписания растёт быстрее всего остального. */
          date_start: {
            _gte: new Date().toISOString().slice(0, 10),
          } as unknown as { _eq: string },
        },
        sort: ['date_start'],
        limit: -1,
      }),
    ),
    client.request(
      readItems('destinations', { filter: published, sort: ['sort'], limit: -1 }),
    ),
    client.request(
      readItems('departure_cities', {
        filter: published,
        sort: ['sort'],
        limit: -1,
      }),
    ),
  ])

  return {
    source: 'directus',
    tours,
    departures,
    destinations,
    cities,
  } as CatalogData
}

const catalogFromMock = (): CatalogData => ({
  source: 'mock',
  tours: [...mockLanding.excursions, ...mockLanding.tours],
  departures: mockLanding.departures,
  destinations: mockLanding.destinations,
  cities: mockLanding.departureCities,
})

/** Данные каталога. Без Directus — те же моки, что и на главной. */
export function useCatalog() {
  const config = useRuntimeConfig()

  /* Данные могли приехать с сервера уже из моков — значит, CMS не ответила
     ещё на отрисовке. Запоминаем это сразу, иначе первый же переход по
     ссылке снова полез бы в недоступный Directus и ждал бы отказа. */
  const result = useAsyncData<CatalogData>(
    'catalog',
    async () => {
      /* Если CMS только что не ответила — не ждём её снова: полминуты
         отдаём моки сразу, потом пробуем ещё раз. */
      if (config.public.useMock || directusDown()) return catalogFromMock()
      try {
        return await fetchCatalog()
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        markDirectusDown()
        console.warn(`[catalog] Directus недоступен (${msg}) — рендерю моки`)
        return catalogFromMock()
      }
    },
    { default: catalogFromMock },
  )
  if (
    import.meta.client &&
    !config.public.useMock &&
    result.data.value?.source === 'mock'
  ) {
    markDirectusDown()
  }

  return result
}
