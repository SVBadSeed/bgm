import type { RouterConfig } from '@nuxt/schema'

/*
 * Прокрутка при переходах. По умолчанию Nuxt отправляет наверх на каждый
 * переход, а в каталоге переход — это ещё и щелчок по фильтру: страница та же,
 * меняется только адресная часть. Улетать при этом в начало страницы нельзя,
 * человек теряет место, где выбирал.
 *
 * behavior: 'instant' обязателен. У html стоит scroll-behavior: smooth ради
 * плавных якорей, и без явного указания новая страница открывалась там же,
 * где человек стоял на старой, а потом медленно доезжала до начала.
 */
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return { ...savedPosition, behavior: 'instant' }
    if (to.path === from.path) return false
    if (to.hash) return { el: to.hash, top: 90, behavior: 'smooth' }
    return { top: 0, behavior: 'instant' }
  },
}
