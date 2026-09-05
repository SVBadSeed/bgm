<script setup lang="ts">
  /*
   * Компактная панель, которая приезжает сверху, когда hero уехал за экран.
   * Отдельный компонент, а не переиспользованная .lp-header: у шапки над фото
   * своя логика цветов (светлая/тёмная по фону кадра), смешивать их незачем.
   */
  import type { Destination, MenuItem, SiteSettings } from '~/types/schema'

  withDefaults(
    defineProps<{
      menu: MenuItem[]
      settings: SiteSettings
      searchPlaceholder?: string | null
      destinations?: Destination[]
      allUrl?: string | null
    }>(),
    { searchPlaceholder: null, destinations: () => [], allUrl: null },
  )

  /* Поиск переезжает сюда из hero: когда строка над кадром уходит за кромку,
     её место занимает эта. Тот же обработчик, что и в HeroSection. */
  const query = ref('')
  function onSearch() {
    if (query.value.trim()) window.location.hash = '#tours'
  }

  const shown = ref(false)

  let threshold = 640
  let ticking = false

  function measure() {
    const hero = document.querySelector<HTMLElement>('.hero-band')
    threshold = (hero?.offsetHeight ?? 640) - 90
  }

  function onScroll() {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      shown.value = window.scrollY > threshold
      ticking = false
    })
  }

  onMounted(() => {
    measure()
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', measure)
  })
</script>

<template>
  <div class="stickybar" :class="{ on: shown }" :aria-hidden="!shown">
    <!-- .wrap — та же колонка, что у секций: панель тянется во всю ширину,
         а её содержимое выровнено по контенту страницы -->
    <div class="wrap">
      <BrandLogo :name="settings.brand_name" />

      <form class="stickybar-search" @submit.prevent="onSearch">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9A9AA4"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          v-model="query"
          type="text"
          :placeholder="searchPlaceholder ?? 'Куда поедем?'"
          :tabindex="shown ? 0 : -1"
        />
      </form>

      <nav class="stickybar-nav">
        <NavMenu
          :menu="menu"
          :destinations="destinations"
          :all-url="allUrl"
          :focusable="shown"
        />
      </nav>

      <!-- Те же кнопки, что в шапке над кадром: телефон здесь дублировал
           футер, а войти и посмотреть избранное из середины страницы негде. -->
      <a
        class="hd-fav"
        :href="settings.favorites_url ?? '#'"
        :tabindex="shown ? 0 : -1"
        title="Избранное"
      >
        <svg width="25" height="25" viewBox="0 0 25 25" fill="#E44C4C">
          <path d="M17.9 3c-2.35 0-4.38 1.41-5.4 3.46C11.48 4.41 9.45 3 7.1 3 3.73 3 1 5.89 1 9.45c0 3.55 2.09 5.64 4.79 8.32C8.49 20.45 12.5 23 12.5 23s3.88-2.51 6.71-5.23C22.23 14.87 24 13.02 24 9.45 24 5.88 21.27 3 17.9 3Z" />
        </svg>
      </a>
      <a
        class="stickybar-lk"
        :href="settings.lk_url ?? '#'"
        :tabindex="shown ? 0 : -1"
        >Личный кабинет</a
      >
    </div>
  </div>
</template>
