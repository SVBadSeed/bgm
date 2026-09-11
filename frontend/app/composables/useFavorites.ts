/*
 * Избранное на карточках. Пока это витринная механика: список id живёт в
 * localStorage браузера. Когда появится личный кабинет, замена — на запрос
 * к API, интерфейс композабла останется тем же.
 */
const KEY = 'bt:favorites'
let restored = false

export function useFavorites() {
  const ids = useState<string[]>('favorites', () => [])

  /*
   * localStorage есть только в браузере, поэтому на сервере и до гидратации
   * список всегда пуст. Страница избранного по одной пустоте не отличает
   * «ещё не прочитали» от «ничего не отмечено» и успевала моргнуть
   * надписью «здесь пусто» — для этого и флаг.
   */
  const ready = useState<boolean>('favorites-ready', () => false)

  onMounted(() => {
    if (!restored) {
      restored = true
      try {
        const raw = localStorage.getItem(KEY)
        if (raw) ids.value = JSON.parse(raw)
      } catch {
        /* приватный режим или занятое хранилище — живём без избранного */
      }
    }
    ready.value = true
  })

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids.value))
    } catch {
      /* см. выше */
    }
  }

  const has = (id: string) => ids.value.includes(id)

  function toggle(id: string) {
    ids.value = has(id) ? ids.value.filter((x) => x !== id) : [...ids.value, id]
    persist()
  }

  function clear() {
    ids.value = []
    persist()
  }

  return { ids, ready, has, toggle, clear }
}
