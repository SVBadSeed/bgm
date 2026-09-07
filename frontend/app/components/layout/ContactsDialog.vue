<script setup lang="ts">
  /*
   * Контакты окном поверх страницы, а не отдельной страницей. Человек листает
   * каталог, накрутил фильтры и хочет уточнить вопрос: увести его на страницу
   * контактов значит потерять подборку и заставить возвращаться назад.
   *
   * Открывается любой ссылкой на #contacts — в шапке, в футере, потом на
   * странице тура. Перехватываем клик здесь, а не в каждом меню: ссылка на
   * контакты может появиться где угодно, а окно одно.
   *
   * Разложено тремя карточками, как на bogema.ru/kontakty: бесплатная линия,
   * офис, номер для сообщений. Ряд одинаковых цветных кружков вместо этого
   * читался как «мы есть везде», но не отвечал на вопрос, куда писать ночью.
   */
  import type { SiteSettings } from '~/types/schema'

  const props = defineProps<{ settings: SiteSettings }>()

  const open = useState('contacts-open', () => false)

  /* Мессенджеры на втором номере: показываем только заполненные */
  const messengers = computed(() => {
    const s = props.settings
    return [
      { key: 'whatsapp', label: 'WhatsApp', href: s.whatsapp_url },
      { key: 'telegram', label: 'Telegram', href: s.telegram_url },
      { key: 'max', label: 'MAX', href: s.max_url },
    ].filter((m) => m.href)
  })

  /* Карта грузится только вместе с окном: чужой виджет на каждой странице
     сайта — это лишние запросы там, где карту никто не открывал. */
  const mapSrc = computed(() => {
    const s = props.settings
    if (s.map_url) return s.map_url
    if (!s.address) return null
    return `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(s.address)}&z=17`
  })

  function close() {
    open.value = false
  }

  function onDocClick(e: MouseEvent) {
    const link = (e.target as HTMLElement).closest?.('a[href$="#contacts"]')
    if (!link) return
    e.preventDefault()
    open.value = true
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') close()
  }

  watch(open, (v) => {
    if (import.meta.client) document.body.style.overflow = v ? 'hidden' : ''
  })

  onMounted(() => {
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('click', onDocClick)
    document.removeEventListener('keydown', onKey)
    if (import.meta.client) document.body.style.overflow = ''
  })
</script>

<template>
  <Teleport to="body">
    <Transition name="cdlg">
      <div v-if="open" class="cdlg-veil" @click.self="close">
        <div class="cdlg" role="dialog" aria-modal="true" aria-label="Контакты">
          <button
            type="button"
            class="cdlg-x"
            aria-label="Закрыть"
            @click="close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                stroke-width="2.4"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <h2 class="cdlg-h">Наши контакты</h2>

          <div class="cdlg-grid">
            <section v-if="settings.phone" class="ccard">
              <p v-if="settings.phone_kicker" class="ccard-cap">
                {{ settings.phone_kicker }}
              </p>
              <a class="ccard-tel" :href="settings.phone_href ?? '#'">
                {{ settings.phone }}
              </a>
              <p v-if="settings.phone_note" class="ccard-note">
                {{ settings.phone_note }}
              </p>
            </section>

            <section v-if="settings.address" class="ccard">
              <p class="ccard-cap">
                {{ settings.office_title ?? 'Офис' }}
              </p>
              <p class="ccard-addr">{{ settings.address }}</p>
              <p v-if="settings.work_hours" class="ccard-note">
                {{ settings.work_hours }}
              </p>
            </section>

            <section v-if="settings.phone2" class="ccard">
              <a class="ccard-tel" :href="settings.phone2_href ?? '#'">
                {{ settings.phone2 }}
              </a>
              <p v-if="settings.phone2_note" class="ccard-note">
                {{ settings.phone2_note }}
              </p>
              <div v-if="messengers.length" class="ccard-ways">
                <a
                  v-for="m in messengers"
                  :key="m.key"
                  class="cway"
                  :class="`is-${m.key}`"
                  :href="m.href ?? '#'"
                >
                  <SocialIcon :name="m.key" :size="16" />
                  {{ m.label }}
                </a>
              </div>
            </section>
          </div>

          <iframe
            v-if="mapSrc"
            class="cdlg-map"
            :src="mapSrc"
            title="Как нас найти"
            loading="lazy"
            allowfullscreen
          ></iframe>

          <div class="cdlg-foot">
            <a v-if="settings.email" class="cdlg-mail" :href="`mailto:${settings.email}`">
              {{ settings.email }}
            </a>
            <div class="socials">
              <a v-if="settings.vk_url" :href="settings.vk_url" title="ВКонтакте">
                <SocialIcon name="vk" />
              </a>
              <a
                v-if="settings.telegram_url"
                :href="settings.telegram_url"
                title="Telegram"
              >
                <SocialIcon name="telegram" />
              </a>
              <a
                v-if="settings.whatsapp_url"
                :href="settings.whatsapp_url"
                title="WhatsApp"
              >
                <SocialIcon name="whatsapp" />
              </a>
              <a v-if="settings.max_url" :href="settings.max_url" title="MAX">
                <SocialIcon name="max" />
              </a>
            </div>
          </div>

          <p v-if="settings.about" class="cdlg-legal">{{ settings.about }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
