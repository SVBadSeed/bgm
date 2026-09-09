/*
 * Подхватывает тему, которую скрипт из <head> уже выставил на <html>, и
 * дальше следит за системой: если человек не выбирал тему руками, смена
 * оформления в macOS или Windows должна доезжать до открытой вкладки сама.
 *
 * Плагин отрабатывает до монтирования приложения, поэтому к моменту
 * гидратации состояние уже верное. Разметка от него не зависит — какая
 * иконка видна в переключателе, решает CSS по data-theme, — иначе Vue
 * ругался бы на расхождение с тем, что отдал сервер.
 */
export default defineNuxtPlugin(() => {
  const { choice, system, apply } = useTheme()

  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  system.value = mq.matches ? 'dark' : 'light'

  try {
    const saved = localStorage.getItem(THEME_KEY)
    choice.value = saved === 'light' || saved === 'dark' ? saved : 'auto'
  } catch {
    choice.value = 'auto'
  }

  apply()

  mq.addEventListener('change', (e) => {
    system.value = e.matches ? 'dark' : 'light'
    apply()
  })
})
