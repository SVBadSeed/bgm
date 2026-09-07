import type { RouterConfig } from '@nuxt/schema'

/*
 * Прокрутка при переходах. По умолчанию Nuxt отправляет наверх на каждый
 * переход, а в каталоге переход — это ещё и щелчок по фильтру: страница та же,
 * меняется только адресная часть. Улетать при этом в начало страницы нельзя,
 * человек теряет место, где выбирал.
 */
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.path === from.path) return false
    if (to.hash) return { el: to.hash, top: 90, behavior: 'smooth' }
    return { top: 0 }
  },
}
