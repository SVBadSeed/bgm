<script setup lang="ts">
  /*
   * Плавающая шапка внутри .hero-band. Цвета (белый/тёмный) переключает CSS
   * через .hero-band:has(.hero-shot.on .slot-empty) — см. landing.css.
   */
  import type { Destination, MenuItem, SiteSettings } from '~/types/schema'

  const props = withDefaults(
    defineProps<{
      menu: MenuItem[]
      settings: SiteSettings
      destinations?: Destination[]
      /* Ссылка «Все направления» живёт в landing, а не в настройках сайта */
      allUrl?: string | null
    }>(),
    { destinations: () => [], allUrl: null },
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
        url: d.url ?? '#',
      }))
    }
    return []
  }

  const open = ref(false)
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
  })
  onBeforeUnmount(() => {
    document.removeEventListener('click', onDocClick)
    document.removeEventListener('keydown', onKey)
  })
</script>

<template>
  <header class="lp-header">
    <div class="wrap">
      <BrandLogo :name="settings.brand_name" />

      <nav class="lp-nav">
        <NavMenu
          :menu="menu"
          :destinations="destinations"
          :all-url="allUrl"
        />
      </nav>

      <div class="hd-icons">
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
