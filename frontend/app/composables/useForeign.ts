import { readItems, readSingleton } from '@directus/sdk'
import { mockForeignOffers, mockForeignPage } from '~/data/mock'
import type { ForeignOffer, ForeignPage } from '~/types/schema'

/**
 * Страница зарубежных туров. Отдельно от useLanding и useCatalog: подбором
 * занимается партнёрский модуль, а от нас нужна только обвязка вокруг него —
 * тексты страницы и витрина предложений.
 */
export interface ForeignData {
  source: 'directus' | 'mock'
  page: ForeignPage
  offers: ForeignOffer[]
}

const published = { status: { _eq: 'published' } } as const

async function fetchForeign(): Promise<ForeignData> {
  const client = useDirectus()

  const [page, offers] = await Promise.all([
    client.request(readSingleton('foreign_page')),
    client.request(
      readItems('foreign_offers', {
        filter: published,
        sort: ['sort'],
        limit: -1,
      }),
    ),
  ])

  return { source: 'directus', page, offers } as ForeignData
}

const foreignFromMock = (): ForeignData => ({
  source: 'mock',
  page: mockForeignPage,
  offers: mockForeignOffers,
})

/** Данные страницы «Зарубежные туры». Без Directus — моки, как везде. */
export function useForeign() {
  const config = useRuntimeConfig()

  return useAsyncData<ForeignData>(
    'foreign',
    async () => {
      if (config.public.useMock) return foreignFromMock()
      try {
        return await fetchForeign()
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        console.warn(`[foreign] Directus недоступен (${msg}) — рендерю моки`)
        return foreignFromMock()
      }
    },
    { default: foreignFromMock },
  )
}
