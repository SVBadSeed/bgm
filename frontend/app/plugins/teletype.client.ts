/*
 * Виджет чата Teletype («Служба заботы о туристах»).
 *
 * Ключ живёт в NUXT_PUBLIC_TELETYPE_ID: не задан — скрипт не грузится вовсе.
 * Поэтому в деве и на превью чат не мешает, а включается одной переменной.
 *
 * Грузим после того, как страница отрисована и браузер освободился: виджет
 * тянет свой бандл, шрифты и аватары, и на первом экране это лишние сотни
 * килобайт в самый неподходящий момент.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const id = useRuntimeConfig().public.teletypeId
  if (!id) return

  let started = false
  function load() {
    if (started || document.getElementById('teletype-widget-embed')) return
    started = true

    /* Виджет читает ключ из глобальной переменной — иначе он не знает,
       чей чат открывать. */
    ;(window as unknown as { teletypeExternalId: string }).teletypeExternalId =
      id

    const s = document.createElement('script')
    s.id = 'teletype-widget-embed'
    s.src = `https://widget.teletype.app/init.js?_=${Date.now()}`
    s.async = true
    s.setAttribute('data-embed-version', '0.1')
    document.head.appendChild(s)
  }

  nuxtApp.hook('app:mounted', () => {
    /* requestIdleCallback есть не везде (Safari) — там просто небольшая пауза */
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(load, { timeout: 4000 })
    } else {
      setTimeout(load, 2500)
    }
  })
})
