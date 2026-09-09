<script setup lang="ts">
  /*
   * Шапка сайта. Над кадром — на главной и в разделах каталога — она приколота
   * к верху и едет вместе со страницей в своём обычном виде; никакой второй,
   * уменьшенной панели нет, это одна и та же шапка.
   *
   * Белой она становится, когда в неё садится строка поиска с кадра —
   * и на главной, и в каталоге: там своя, крупная панель поиска. Раньше в
   * каталоге отсчёт шёл от нижней кромки фото, и весь заголовок раздела
   * успевал проехать сквозь прозрачную шапку — буквы шли поверх пунктов
   * меню. Если поиска на странице нет, граница прежняя: конец кадра.
   *
   * Цвета (белый/тёмный) переключает CSS через
   * .hero-band:has(.hero-shot.on .slot-empty) — см. landing.css.
   */
  import type {
    DepartureCity,
    Destination,
    MenuItem,
    SiteSettings,
  } from '~/types/schema'

  const props = withDefaults(
    defineProps<{
      menu: MenuItem[]
      settings: SiteSettings
      destinations?: Destination[]
      cities?: DepartureCity[]
      /* Ссылка «Все направления» живёт в landing, а не в настройках сайта */
      allUrl?: string | null
      /* Шапка висит над кадром и приколота к верху */
      float?: boolean
      /* Поле поиска в шапке нужно только на главной: в каталоге свой поиск */
      search?: boolean
      searchPlaceholder?: string | null
    }>(),
    {
      destinations: () => [],
      cities: () => [],
      allUrl: null,
      float: false,
      search: false,
      searchPlaceholder: null,
    },
  )

  /* Мобильное меню строится тем же деревом, что и NavMenu, но раскрыто
     сразу: вложенные шторки на телефоне только добавляют шаг. */
  const header = computed(() =>
    props.menu.filter((m) => m.placement === 'header'),
  )
  const items = computed(() => header.value.filter((m) => !m.parent))
  function submenu(m: MenuItem) {
    const own = header.value.filter((c) => c.parent === m.id)
    if (own.length) {
      return own.map((c) => ({ key: c.id, label: c.label, url: c.url }))
    }
    if (props.destinations.length && /направлен/i.test(m.label)) {
      return props.destinations.map((d) => ({
        key: d.id,
        label: d.name,
        url: destinationUrl(d),
      }))
    }
    if (props.cities.length && /город/i.test(m.label)) {
      return props.cities.map((c) => ({
        key: c.id,
        label: c.name,
        url: cityUrl(c),
      }))
    }
    return []
  }

  const open = ref(false)

  /*
   * Считаем по живому положению элементов: кадр меняет высоту, пока грузится
   * фотография, и запомненные однажды пороги уезжают.
   */
  const solid = ref(false)
  const root = ref<HTMLElement | null>(null)
  let ticking = false

  function onScroll() {
    if (!props.float || ticking) return
    ticking = true
    requestAnimationFrame(() => {
      ticking = false
      const h = root.value?.offsetHeight ?? 70
      /* Поиск главной или каталога — смотря куда попали; берём тот, что есть */
      const field = document.querySelector<HTMLElement>(
        '.hero-search, .csearch-panel',
      )
      if (field) {
        /* Строка поиска подходит под нижнюю кромку — её место занимает
           такое же поле внутри шапки. */
        solid.value = field.getBoundingClientRect().top <= h
        return
      }
      /* Иначе граница — конец кадра под шапкой: дальше идёт белое полотно. */
      const cover = document.querySelector<HTMLElement>('.chero, .hero-band')
      solid.value = cover
        ? cover.getBoundingClientRect().bottom <= h
        : window.scrollY > h
    })
  }

  /* Поиск из шапки ведёт в каталог: это единственное место, где он что-то
     делает, — на главной искать не по чему. */
  const query = ref('')
  function onSearch() {
    const q = query.value.trim()
    if (q) navigateTo({ path: '/tury', query: { poisk: q } })
  }
  const close = () => (open.value = false)

  function onDocClick(e: MouseEvent) {
    const t = e.target as HTMLElement
    if (!t.closest('[data-mnav]') && !t.closest('[data-burger]')) close()
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') close()
  }
  onMounted(() => {
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    if (props.float) {
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll)
    }
  })
  onBeforeUnmount(() => {
    document.removeEventListener('click', onDocClick)
    document.removeEventListener('keydown', onKey)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  })
</script>

<template>
  <header
    ref="root"
    class="lp-header"
    :class="{ 'is-float': float, 'is-solid': float && solid }"
  >
    <div class="wrap">
      <BrandLogo :name="settings.brand_name" />

      <!-- Поле приезжает снизу, оттуда, где строка осталась над кадром -->
      <form v-if="float && search" class="hd-search" @submit.prevent="onSearch">
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
          type="search"
          :placeholder="searchPlaceholder ?? 'Куда поедем?'"
          :tabindex="solid ? 0 : -1"
        />
      </form>

      <nav class="lp-nav">
        <NavMenu
          :menu="menu"
          :destinations="destinations"
          :cities="cities"
          :all-url="allUrl"
        />
      </nav>

      <div class="hd-icons">
        <ThemeToggle />
        <a
          class="hd-fav"
          :href="settings.favorites_url ?? '#'"
          title="Избранное"
        >
          <!-- Форма сердца взята с bogema.ru (Solar Heart Bold) -->
          <svg width="27" height="27" viewBox="0 0 25 25" fill="#E44C4C">
            <path d="M17.9 3c-2.35 0-4.38 1.41-5.4 3.46C11.48 4.41 9.45 3 7.1 3 3.73 3 1 5.89 1 9.45c0 3.55 2.09 5.64 4.79 8.32C8.49 20.45 12.5 23 12.5 23s3.88-2.51 6.71-5.23C22.23 14.87 24 13.02 24 9.45 24 5.88 21.27 3 17.9 3Z" />
          </svg>
        </a>
        <!-- Кабинет подписан словами: иконка человечка без подписи читается
             как «профиль», а не как вход, и её нажимают вслепую. -->
        <a class="hd-lk" :href="settings.lk_url ?? '#'">Личный кабинет</a>
        <button
          class="hd-ico burger"
          type="button"
          data-burger
          aria-label="Меню"
          :aria-expanded="open ? 'true' : 'false'"
          @click.stop="open = !open"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <nav v-if="open" class="mnav open" data-mnav>
      <template v-for="(m, i) in items" :key="m.id">
        <a :href="m.url" :style="{ '--i': i }" @click="close">{{ m.label }}</a>
        <!-- Дети раскрыты сразу: на телефоне вложенные шторки только
             добавляют шаг, а места по вертикали хватает. -->
        <a
          v-for="l in submenu(m)"
          :key="l.key"
          class="mnav-sub"
          :href="l.url"
          :style="{ '--i': i }"
          @click="close"
          >{{ l.label }}</a
        >
      </template>
    </nav>
  </header>
</template>
