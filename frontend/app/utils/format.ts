const NBSP = ' '

/** 24900 → "24 900 ₽" (неразрывные пробелы) */
export function formatPrice(value: number | null | undefined): string {
  if (value == null) return ''
  const s = Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
  return `${s}${NBSP}₽`
}

/** "Марина Ковалёва" → "МК" */
export function initials(name: string | null | undefined): string {
  return (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}
