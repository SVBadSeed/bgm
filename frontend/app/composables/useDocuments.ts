import { readItems } from '@directus/sdk'
import { mockDocuments } from '~/data/legal'
import type { LegalDoc } from '~/types/schema'

/**
 * Юридические страницы: оферта, политика и всё, что заведут рядом.
 *
 * Отдельным запросом, а не куском общих данных: документы читают редко, а
 * весят они больше всего остального контента вместе взятого — тащить их на
 * каждую страницу сайта незачем.
 */
export interface DocumentsData {
  source: 'directus' | 'mock'
  items: LegalDoc[]
}

const published = { status: { _eq: 'published' } } as const

async function fetchDocuments(): Promise<DocumentsData> {
  const client = useDirectus()
  const items = await client.request(
    readItems('documents', { filter: published, sort: ['sort'], limit: -1 }),
  )
  return { source: 'directus', items } as DocumentsData
}

const fromMock = (): DocumentsData => ({ source: 'mock', items: mockDocuments })

export function useDocuments() {
  const config = useRuntimeConfig()

  const result = useAsyncData<DocumentsData>(
    'documents',
    async () => {
      /* Если CMS только что не ответила — не ждём её снова: полминуты
         отдаём моки сразу, потом пробуем ещё раз. */
      if (config.public.useMock || directusDown()) return fromMock()
      try {
        return await fetchDocuments()
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        markDirectusDown()
        console.warn(`[documents] Directus недоступен (${msg}) — рендерю моки`)
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
