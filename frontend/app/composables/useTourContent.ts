import { readItems } from '@directus/sdk'
import { mockTourDays, mockTourPhotos } from '~/data/mock'
import type { TourDay, TourPhoto } from '~/types/schema'

/**
 * Содержимое страницы тура: программа по дням и галерея.
 *
 * Отдельно от useCatalog намеренно: там витрина и фильтры, а это грузится
 * ровно для одного тура и только когда его открыли.
 */
export interface TourContent {
  source: 'directus' | 'mock'
  days: TourDay[]
  photos: TourPhoto[]
}

const published = { status: { _eq: 'published' } } as const

const idOf = (v: unknown): string =>
  typeof v === 'string' ? v : ((v as { id?: string })?.id ?? '')

async function fetchContent(tourId: string): Promise<TourContent> {
  const client = useDirectus()
  const filter = { ...published, tour: { _eq: tourId } }

  const [days, photos] = await Promise.all([
    client.request(
      readItems('tour_days', { filter, sort: ['sort'], limit: -1 }),
    ),
    client.request(
      readItems('tour_photos', { filter, sort: ['sort'], limit: -1 }),
    ),
  ])

  return { source: 'directus', days, photos } as TourContent
}

const fromMock = (tourId: string): TourContent => ({
  source: 'mock',
  days: mockTourDays.filter((d) => idOf(d.tour) === tourId),
  photos: mockTourPhotos.filter((p) => idOf(p.tour) === tourId),
})

/** Программа и фото одного тура. Без Directus — те же моки, что и везде. */
export function useTourContent(tourId: string) {
  const config = useRuntimeConfig()

  /* Данные могли приехать с сервера уже из моков — значит, CMS не ответила
     ещё на отрисовке. Запоминаем это сразу, иначе первый же переход по
     ссылке снова полез бы в недоступный Directus и ждал бы отказа. */
  const result = useAsyncData<TourContent>(
    `tour-content-${tourId}`,
    async () => {
      /* Если CMS только что не ответила — не ждём её снова: полминуты
         отдаём моки сразу, потом пробуем ещё раз. */
      if (config.public.useMock || directusDown()) return fromMock(tourId)
      try {
        return await fetchContent(tourId)
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        markDirectusDown()
        console.warn(`[tour] Directus недоступен (${msg}) — рендерю моки`)
        return fromMock(tourId)
      }
    },
    /* lazy: переход по карточке не должен ждать сеть. На сервере данные
       всё равно резолвятся до отрисовки, так что в разметке они есть. */
    { lazy: true, default: () => fromMock(tourId) },
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
