import type { ImageRef } from '~/types/schema'

export interface AssetOptions {
  width?: number
  height?: number
  fit?: 'cover' | 'contain' | 'inside' | 'outside'
  quality?: number
  format?: 'webp' | 'avif' | 'jpg' | 'png' | 'auto'
}

/**
 * Строит URL картинки Directus с трансформацией на лету.
 * Строка, начинающаяся с "/" или "http", считается готовым адресом (моки, внешние файлы).
 */
export function useAssetUrl() {
  const { public: pub } = useRuntimeConfig()

  return (file: ImageRef, opts: AssetOptions = {}): string | null => {
    if (!file) return null
    const id = typeof file === 'string' ? file : file.id
    if (!id) return null
    if (id.startsWith('/') || id.startsWith('http')) return id

    const q = new URLSearchParams()
    if (opts.width) q.set('width', String(opts.width))
    if (opts.height) q.set('height', String(opts.height))
    q.set('fit', opts.fit ?? 'cover')
    q.set('quality', String(opts.quality ?? 82))
    q.set('format', opts.format ?? 'webp')
    return `${pub.directusUrl}/assets/${id}?${q}`
  }
}
