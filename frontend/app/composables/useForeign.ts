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

  /* Данные могли приехать с сервера уже из моков — значит, CMS не ответила
     ещё на отрисовке. Запоминаем это сразу, иначе первый же переход по
     ссылке снова полез бы в недоступный Directus и ждал бы отказа. */
  const result = useAsyncData<ForeignData>(
    'foreign',
    async () => {
      /* Если CMS только что не ответила — не ждём её снова: полминуты
         отдаём моки сразу, потом пробуем ещё раз. */
      if (config.public.useMock || directusDown()) return foreignFromMock()
      try {
        return await fetchForeign()
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        markDirectusDown()
        console.warn(`[foreign] Directus недоступен (${msg}) — рендерю моки`)
        return foreignFromMock()
      }
    },
    { default: foreignFromMock },
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
