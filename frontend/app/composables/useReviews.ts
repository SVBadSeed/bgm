import { readItems } from '@directus/sdk'
import { mockLanding, mockReviewPhotos } from '~/data/mock'
import type { Review, ReviewPhoto } from '~/types/schema'

/**
 * Отзывы для отдельной страницы: все, что есть, вместе с фотографиями.
 *
 * На главной берётся тот же список, но там он ограничен витриной и без
 * кадров — тащить фотографии на каждую страницу сайта незачем.
 */
export interface ReviewsData {
  source: 'directus' | 'mock'
  items: Review[]
  photos: ReviewPhoto[]
}

const published = { status: { _eq: 'published' } } as const

async function fetchReviews(): Promise<ReviewsData> {
  const client = useDirectus()

  const [items, photos] = await Promise.all([
    client.request(
      readItems('reviews', {
        filter: published,
        sort: ['sort'],
        limit: -1,
        fields: ['*', { tour: ['id', 'title', 'slug'] }, { city: ['id', 'name'] }],
      }),
    ),
    client.request(
      readItems('review_photos', { filter: published, sort: ['sort'], limit: -1 }),
    ),
  ])

  return { source: 'directus', items, photos } as ReviewsData
}

const fromMock = (): ReviewsData => ({
  source: 'mock',
  items: mockLanding.reviews,
  photos: mockReviewPhotos,
})

export function useReviews() {
  const config = useRuntimeConfig()

  const result = useAsyncData<ReviewsData>(
    'reviews',
    async () => {
      /* Если CMS только что не ответила — не ждём её снова: полминуты
         отдаём моки сразу, потом пробуем ещё раз. */
      if (config.public.useMock || directusDown()) return fromMock()
      try {
        return await fetchReviews()
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        markDirectusDown()
        console.warn(`[reviews] Directus недоступен (${msg}) — рендерю моки`)
        return fromMock()
      }
    },
    { default: fromMock },
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
