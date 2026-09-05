/*
 * Знаки внутри заголовков. В тексте пишутся плейсхолдерами — {mountains},
 * {route}, {loop}, {paw}, — а разбирает их эта функция. Так место знака
 * задаёт редактор в Directus, а не вёрстка, и один и тот же приём работает
 * и в hero, и в промо-полосе.
 */
export const TITLE_ICONS = ['mountains', 'route', 'loop', 'paw'] as const

export type TitleIconName = (typeof TITLE_ICONS)[number]

export type TitlePart = { icon?: TitleIconName; text?: string }

const RE = /\{(mountains|route|loop|paw)\}/

function isIcon(chunk: string): chunk is TitleIconName {
  return (TITLE_ICONS as readonly string[]).includes(chunk)
}

/** Одна строка → куски текста и знаки между ними */
export function splitTitleParts(line: string): TitlePart[] {
  return line
    .split(RE)
    .filter(Boolean)
    .map((chunk) => (isIcon(chunk) ? { icon: chunk } : { text: chunk }))
}

/** Многострочный заголовок → строки, каждая разобрана на части */
export function splitTitleLines(title: string | null): TitlePart[][] {
  return (title ?? '')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(splitTitleParts)
}
