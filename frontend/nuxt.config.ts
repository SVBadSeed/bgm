// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/fonts', '@nuxt/eslint'],

  // Компоненты без префикса папки: components/ui/TourCard.vue → <TourCard>
  components: [{ path: '~/components', pathPrefix: false }],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      titleTemplate: '%s',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      script: [
        {
          // Тема выставляется до первой отрисовки, иначе страница успевает
          // моргнуть белым. Порядок: выбор человека из localStorage, а если
          // его нет — тема системы. Дальше за темой следит плагин theme.client.
          innerHTML:
            "try{var t=localStorage.getItem('bt-theme');" +
            "if(t!=='light'&&t!=='dark')" +
            "t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';" +
            "document.documentElement.dataset.theme=t}catch(e){}",
          tagPosition: 'head',
        },
      ],
    },
  },

  // Переопределяется переменными NUXT_* (см. .env.example)
  runtimeConfig: {
    // Только сервер: адрес Directus внутри docker-сети (если отличается от публичного)
    directusInternalUrl: '',
    // Только сервер: статический токен для записи заявок/подписок (иначе — public-права)
    directusToken: '',
    public: {
      directusUrl: 'http://localhost:8055',
      siteUrl: 'http://localhost:3000',
      // true → не ходить в Directus вообще, рендерить моки (удобно верстать без бэка)
      useMock: false,
      // Ключ чата Teletype. Пусто — виджет не подключается (дев и превью)
      teletypeId: '',
    },
  },

  fonts: {
    families: [
      {
        name: 'Golos Text',
        provider: 'google',
        weights: [400, 500, 600, 700, 800],
      },
      { name: 'Onest', provider: 'google', weights: [500, 600, 700, 800] },
    ],
  },

  routeRules: {
    // На проде можно включить ISR/SWR, чтобы не дёргать Directus на каждый запрос:
    // '/': { swr: 60 },
  },

  nitro: {
    compressPublicAssets: true,
  },

  eslint: {
    config: { stylistic: false },
  },

  typescript: {
    strict: true,
  },
})
