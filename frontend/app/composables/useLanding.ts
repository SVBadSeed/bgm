import { readItems, readSingleton } from '@directus/sdk'
import { mockLanding } from '~/data/mock'
import type { LandingData } from '~/types/schema'

const published = { status: { _eq: 'published' } } as const

async function fetchFromDirectus(): Promise<LandingData> {
  const client = useDirectus()

  const [
    settings,
    landing,
    menu,
    heroSlides,
    allTours,
    destinations,
    advantages,
    reviews,
  ] = await Promise.all([
    client.request(readSingleton('site_settings')),
    client.request(readSingleton('landing')),
    client.request(
      readItems('menu_items', { filter: published, sort: ['sort'], limit: -1 }),
    ),
    client.request(
      readItems('hero_slides', {
        filter: published,
        sort: ['sort'],
        limit: -1,
      }),
    ),
    client.request(
      readItems('tours', {
        filter: { ...published, featured: { _eq: true } },
        sort: ['sort'],
        limit: -1,
        fields: ['*', { destination: ['id', 'name', 'slug'] }],
      }),
    ),
    client.request(
      readItems('destinations', {
        filter: { ...published, featured: { _eq: true } },
        sort: ['sort'],
        limit: -1,
      }),
    ),
    client.request(
      readItems('advantages', { filter: published, sort: ['sort'], limit: -1 }),
    ),
    client.request(
      readItems('reviews', {
        filter: published,
        sort: ['sort'],
        limit: -1,
        fields: ['*', { tour: ['id', 'title', 'place_label', 'image'] }],
      }),
    ),
  ])

  return {
    source: 'directus',
    settings,
    landing,
    menu,
    heroSlides,
    excursions: allTours.filter((t) => t.kind === 'excursion'),
    tours: allTours.filter((t) => t.kind === 'tour'),
    destinations,
    advantages,
    reviews,
  } as LandingData
}

/**
 * Данные главной страницы. Один запрос на SSR, кэш по ключу 'landing'
 * (layout и page используют один и тот же результат).
 * Если Directus недоступен — тихо отдаём моки, чтобы верстать можно было всегда.
 */
export function useLanding() {
  const config = useRuntimeConfig()

  return useAsyncData<LandingData>(
    'landing',
    async () => {
      if (config.public.useMock) return mockLanding
      try {
        return await fetchFromDirectus()
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        console.warn(`[landing] Directus недоступен (${msg}) — рендерю моки`)
        return mockLanding
      }
    },
    { default: () => mockLanding },
  )
}
