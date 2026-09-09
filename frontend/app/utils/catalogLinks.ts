/*
 * Адреса разделов каталога. Собраны в одном месте, потому что ссылки на
 * направление стоят в меню, в плитке направлений и в «популярном» — если
 * считать их на месте, то один раздел рано или поздно уедет не туда.
 *
 * Поле url в админке главнее: им можно увести направление на посадочную
 * страницу, если под него сделают отдельную.
 */
import type { DepartureCity, Destination, Tour } from '~/types/schema'

export function destinationUrl(d: Destination): string {
  if (d.url && d.url !== '#') return d.url
  return d.slug ? `/napravleniya/${d.slug}` : '/tury'
}

/* Тур ведёт на свою страницу. Поле url в админке главнее — им можно увести
   тур на сторонний адрес, пока страницы под него нет. */
export function tourUrl(t: Tour): string {
  if (t.url && t.url !== '#') return t.url
  return t.slug ? `/tury/${t.slug}` : '/tury'
}

export function cityUrl(c: DepartureCity): string {
  return c.slug ? `/goroda/${c.slug}` : '/tury'
}
