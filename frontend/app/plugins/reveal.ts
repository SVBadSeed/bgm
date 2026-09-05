/*
 * Директива v-reveal: мягкое появление элемента при прокрутке.
 *
 *   <div v-reveal>                     — подъём снизу (по умолчанию)
 *   <div v-reveal="'pop'">             — подъём с масштабом
 *   <div v-reveal="'side'">            — выезд сбоку
 *   <div v-reveal="'stagger'">         — появляются ДЕТИ элемента, по очереди
 *   <div v-reveal="'bus'">             — подъезжает слева, колёса прокручиваются
 *   :style="{ '--rv-i': i }"           — задержка внутри списка (стаггер)
 *
 * ГЛАВНОЕ ПРАВИЛО: контент НИКОГДА не прячется в ожидании наблюдателя.
 * Базовое состояние элемента — видимое, класс `rv-play` лишь запускает
 * CSS-анимацию появления. Поэтому невозможны ни пустая секция (не сработал
 * наблюдатель — элемент просто на месте), ни резкий скачок из ниоткуда.
 *
 * Анимация ставится ТОЛЬКО пока элемент ещё под кромкой экрана. Если
 * пользователь долистал быстро и элемент уже в кадре, анимация не ставится
 * вовсе: иначе видимая карточка на миг исчезла бы и появилась заново.
 *
 * Для лент, которые прокручиваются вбок, обязателен режим 'stagger' на самой
 * ленте: если вешать на карточки, наблюдатель упрётся в саму ленту, ведь она
 * обрезает всё, что укатилось вбок.
 *
 * При prefers-reduced-motion директива не делает ничего.
 */
type Kind = 'up' | 'pop' | 'side' | 'stagger' | 'bus'

/* Доля экрана: выше неё элемент пользователь уже видит, анимировать поздно. */
const TOO_LATE = 0.8

let observer: IntersectionObserver | null = null
const pending = new Set<HTMLElement>()
let lastSweep = 0

function play(el: HTMLElement) {
  if (!pending.delete(el)) return
  observer?.unobserve(el)
  if (el.getBoundingClientRect().top < window.innerHeight * TOO_LATE) return
  el.classList.add('rv-play')
  // Класс снимаем, когда анимация отыграла: дальше элемент живёт обычной
  // жизнью и не тащит лишнюю анимацию на hover.
  window.setTimeout(() => el.classList.remove('rv-play'), 1600)
}

/*
 * Страховка к наблюдателю: он завязан на цикл отрисовки и молчит в
 * замороженной вкладке. Вызов синхронный, с троттлингом по часам —
 * requestAnimationFrame и отложенные таймеры здесь не годятся ровно потому,
 * что подводят в тех же случаях, что и сам наблюдатель.
 */
function sweep() {
  if (!pending.size) return
  const h = window.innerHeight
  for (const el of [...pending]) {
    const r = el.getBoundingClientRect()
    if (r.top < h * 1.08 && r.bottom > -200) play(el)
  }
}

function onScroll() {
  const now = Date.now()
  if (now - lastSweep < 80) return
  lastSweep = now
  sweep()
}

function ensureObserver() {
  if (observer || typeof IntersectionObserver === 'undefined') return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) play(entry.target as HTMLElement)
      }
    },
    {
      /* Небольшое поле снизу: анимация стартует у самой кромки. Больший
         запас прятал её от глаз — карточки успевали проявиться до того,
         как пользователь до них долистает. */
      rootMargin: '0px 0px 8% 0px',
      threshold: 0.01,
    },
  )
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  return observer
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive<HTMLElement, Kind | undefined>('reveal', {
    mounted(el, binding) {
      if (
        typeof window === 'undefined' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return
      }
      el.dataset.reveal = binding.value ?? 'up'
      pending.add(el)
      ensureObserver()?.observe(el)
    },
    unmounted(el) {
      pending.delete(el)
      observer?.unobserve(el)
    },
  })
})
