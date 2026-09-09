/*
 * Светлая и тёмная темы.
 *
 * По умолчанию сайт смотрит на тему системы: в macOS и Windows человек уже
 * один раз сказал, как ему удобнее, и переспрашивать незачем. Явный выбор
 * кнопкой запоминается в браузере и с этого момента главнее системы.
 *
 * Хитрость в toggle(): если человек переключился ровно на ту тему, что
 * стоит у него в системе, мы не запоминаем выбор, а возвращаемся к «как в
 * системе». Тогда вечером, когда система сама уйдёт в тёмную, сайт уйдёт
 * вместе с ней — а не останется светлым навсегда из-за одного нажатия.
 *
 * Саму тему на <html data-theme> ставит короткий скрипт в <head>
 * (см. nuxt.config.ts): он отрабатывает до первой отрисовки, иначе страница
 * успевает моргнуть белым. Здесь — только состояние и переключение.
 */
export type ThemeChoice = 'auto' | 'light' | 'dark'
export type Theme = 'light' | 'dark'

export const THEME_KEY = 'bt-theme'

export function useTheme() {
  /* Что выбрал человек и что стоит в системе — две разные вещи, и держать
     их порознь нужно, чтобы уметь вернуться к «как в системе». */
  const choice = useState<ThemeChoice>('theme-choice', () => 'auto')
  const system = useState<Theme>('theme-system', () => 'light')

  const theme = computed<Theme>(() =>
    choice.value === 'auto' ? system.value : choice.value,
  )

  function apply() {
    if (import.meta.server) return
    document.documentElement.dataset.theme = theme.value
  }

  function set(next: ThemeChoice) {
    choice.value = next
    if (import.meta.server) return
    try {
      if (next === 'auto') localStorage.removeItem(THEME_KEY)
      else localStorage.setItem(THEME_KEY, next)
    } catch {
      /* приватный режим — тема продержится до перезагрузки, и ладно */
    }
    apply()
  }

  function toggle() {
    const next: Theme = theme.value === 'dark' ? 'light' : 'dark'
    set(next === system.value ? 'auto' : next)
  }

  return { choice, system, theme, set, toggle, apply }
}
