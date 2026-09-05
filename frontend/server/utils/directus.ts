/*
 * Серверная запись в Directus. Токен (если задан) не утекает в браузер —
 * формы ходят через /api/*, а не напрямую в CMS.
 */
export async function directusCreate(
  collection: string,
  body: Record<string, unknown>,
) {
  const config = useRuntimeConfig()
  const base = config.directusInternalUrl || config.public.directusUrl
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (config.directusToken)
    headers.Authorization = `Bearer ${config.directusToken}`

  try {
    return await $fetch(`${base}/items/${collection}`, {
      method: 'POST',
      headers,
      body,
      timeout: 5000,
    })
  } catch (e) {
    console.error(`[directus] create ${collection} failed:`, e)
    throw createError({
      statusCode: 503,
      statusMessage: 'CMS unavailable',
      message: 'Сервис временно недоступен, попробуйте позже.',
    })
  }
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
