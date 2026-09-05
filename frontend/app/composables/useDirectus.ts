import { createDirectus, rest } from '@directus/sdk'
import type { Schema } from '~/types/schema'

/**
 * Типизированный REST-клиент Directus.
 * На сервере предпочитает внутренний адрес (docker-сеть), в браузере — публичный.
 */
export function useDirectus() {
  const config = useRuntimeConfig()
  const url =
    (import.meta.server && config.directusInternalUrl) ||
    config.public.directusUrl

  return createDirectus<Schema>(url).with(
    rest({
      // Не вешать SSR, если Directus лежит: 4 секунды и отдаём моки
      onRequest: (options) => ({
        ...options,
        signal: AbortSignal.timeout(4000),
      }),
    }),
  )
}
