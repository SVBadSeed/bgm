/*
 * Падежи в заголовках: «Туры в Абхазию», «Туры из Краснодара».
 *
 * Названия приходят из админки в именительном, а в заголовке нужен другой
 * падеж. Держать в базе по три написания на регион — лишняя работа для
 * контент-менеджера, поэтому склоняем правилами, а на случай исключения
 * («Ростов-на-Дону», иностранные названия) у направления и города есть поле
 * для ручного написания — оно перебивает правило.
 */

/** Винительный падеж: «Туры в <…>» */
export function accusative(name: string): string {
  const words = name.trim().split(' ')
  return words.map(accusativeWord).join(' ')
}

function accusativeWord(w: string): string {
  /* Прилагательные: Чеченская → Чеченскую, Синяя → Синюю */
  if (w.endsWith('ая')) return `${w.slice(0, -2)}ую`
  if (w.endsWith('яя')) return `${w.slice(0, -2)}юю`
  /* Существительные женского рода: Абхазия → Абхазию, Адыгея → Адыгею */
  if (w.endsWith('а')) return `${w.slice(0, -1)}у`
  if (w.endsWith('я')) return `${w.slice(0, -1)}ю`
  /* Неодушевлённые мужского и среднего рода в винительном не меняются:
     Дагестан, Краснодарский край, Золотое кольцо */
  return w
}

/** Родительный падеж: «Туры из <…>» */
export function genitive(name: string): string {
  const n = name.trim()
  /* Составные вроде «Ростов-на-Дону» правилам не поддаются — оставляем как есть */
  if (/-на-|-в-/i.test(n)) return n

  const words = n.split(' ')
  return words.map(genitiveWord).join(' ')
}

function genitiveWord(w: string): string {
  if (w.endsWith('ий') || w.endsWith('ый')) return `${w.slice(0, -2)}ого`
  if (w.endsWith('ая')) return `${w.slice(0, -2)}ой`
  /* После шипящих и заднеязычных пишется «и»: Калуга → Калуги, Анапа → Анапы */
  if (w.endsWith('а')) {
    return /[гкхжчшщ]а$/.test(w) ? `${w.slice(0, -1)}и` : `${w.slice(0, -1)}ы`
  }
  if (w.endsWith('я')) return `${w.slice(0, -1)}и`
  if (w.endsWith('ь') || w.endsWith('й')) return `${w.slice(0, -1)}я`
  /* Уже не именительный (Сочи, Тбилиси, Иваново) — не трогаем */
  if (/[уюеиэоы]$/.test(w)) return w
  return `${w}а`
}
