/*
 * Избранное на карточках. Пока это витринная механика: список id живёт в
 * localStorage браузера. Когда появится личный кабинет, замена — на запрос
 * к API, интерфейс композабла останется тем же.
 */
const KEY = 'bt:favorites'
let restored = false

export function useFavorites() {
  const ids = useState<string[]>('favorites', () => [])

  onMounted(() => {
    if (restored) return
    restored = true
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) ids.value = JSON.parse(raw)
    } catch {
      /* приватный режим или занятое хранилище — живём без избранного */
    }
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

  return { ids, has, toggle }
}
