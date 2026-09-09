<script setup lang="ts">
  /*
   * Футер. Порядок блоков взят со старого сайта: слева связь, дальше два
   * столбца ссылок, справа доверие — реестр туроператоров и оценка на картах.
   * Ниже — заявка, соцсети и платёжные системы, в самом низу документы.
   *
   * Столбец направлений собирается из коллекции: добавили регион — он сам
   * появился и в футере. Вести один и тот же список ссылками в меню значит
   * однажды забыть про одно из мест.
   */
  import type {
    Destination,
    ImageRef,
    MenuItem,
    MenuPlacement,
    SiteSettings,
  } from '~/types/schema'

  const props = withDefaults(
    defineProps<{
      menu: MenuItem[]
      settings: SiteSettings
      destinations?: Destination[]
      mascot?: ImageRef
    }>(),
    { destinations: () => [], mascot: null },
  )

  const assetUrl = useAssetUrl()
  const mascotSrc = computed(() =>
    assetUrl(props.mascot, { width: 900, format: 'webp' }),
  )
  const registrySrc = computed(() =>
    assetUrl(props.settings.registry_image, { width: 120 }),
  )
  const paymentsSrc = computed(() =>
    assetUrl(props.settings.payments_image, { width: 900 }),
  )

  const group = (p: MenuPlacement) =>
    props.menu.filter((m) => m.placement === p)
  const company = computed(() => group('footer_company'))
  const legal = computed(() => group('footer_legal'))

  const dests = computed(() =>
    props.destinations.filter((d) => d.slug).slice(0, 9),
  )

  const ratingCount = computed(() => {
    const n = props.settings.rating_count
    if (!n) return null
    return `${n} ${plural(n, 'отзыв', 'отзыва', 'отзывов')}`
  })

  /* Кнопка ведёт к форме заявки, а если её на странице нет — в каталог */
  function toLead() {
    const el = document.getElementById('lead')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      return
    }
    navigateTo('/tury')
  }
</script>

<template>
  <footer class="lp-footer">
    <!-- Барс сидит на границе лаймового полотна и футера. Пока картинки нет,
         блок не рисуется: рисовать вектор в полный рост смысла нет. -->
    <img v-if="mascotSrc" class="footer-mascot" :src="mascotSrc" alt="" />
    <div class="wrap">
      <div class="f-grid">
        <div class="f-col f-contacts">
          <a
            v-if="settings.phone"
            class="f-tel"
            :href="settings.phone_href ?? `tel:${settings.phone}`"
            >{{ settings.phone }}</a
          >
          <p v-if="settings.footer_phone_note" class="f-note">
            {{ settings.footer_phone_note }}
          </p>

          <a
            v-if="settings.email"
            class="f-tel f-mail"
            :href="`mailto:${settings.email}`"
            >{{ settings.email }}</a
          >
          <p v-if="settings.footer_email_note" class="f-note">
            {{ settings.footer_email_note }}
          </p>

          <div v-if="settings.address" class="f-office">
            <h4 v-if="settings.office_title">{{ settings.office_title }}</h4>
            <p>{{ settings.address }}</p>
            <p v-if="settings.work_hours">{{ settings.work_hours }}</p>
          </div>
        </div>

        <div v-if="company.length" class="f-col">
          <div class="f-links">
            <a v-for="m in company" :key="m.id" :href="m.url">{{ m.label }}</a>
          </div>
        </div>

        <div v-if="dests.length" class="f-col">
          <div class="f-links">
            <NuxtLink to="/tury">Все туры</NuxtLink>
            <NuxtLink
              v-for="d in dests"
              :key="d.id"
              :to="`/napravleniya/${d.slug}`"
              >{{ d.name }}</NuxtLink
            >
            <NuxtLink to="/tury">Все направления</NuxtLink>
          </div>
        </div>

        <div class="f-col f-trust">
          <div v-if="settings.registry_line" class="f-registry">
            <div class="f-registry-top">
              <img v-if="registrySrc" :src="registrySrc" alt="" />
              <b>Мы в реестре туроператоров</b>
            </div>
            <span>{{ settings.registry_line }}</span>
          </div>

          <a
            v-if="settings.rating_value"
            class="f-rating"
            :href="settings.rating_url ?? '#'"
            target="_blank"
            rel="noopener"
          >
            <span class="f-rating-h">Яндекс Карты</span>
            <span class="f-rating-row">
              <b>{{ settings.rating_value }}</b>
              <span class="f-stars" aria-hidden="true">
                <svg
                  v-for="n in 5"
                  :key="n"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12 2l3 6.6 7 .7-5.2 4.8 1.4 7-6.2-3.6L5.8 21l1.4-7L2 9.3l7-.7z"
                  />
                </svg>
              </span>
            </span>
            <span v-if="ratingCount" class="f-rating-note">{{
              ratingCount
            }}</span>
          </a>
        </div>
      </div>

      <div class="f-mid">
        <button type="button" class="f-lead" @click="toLead">
          Оставить заявку
        </button>

        <div class="socials">
          <a v-if="settings.telegram_url" :href="settings.telegram_url" title="Telegram">
            <SocialIcon name="telegram" />
          </a>
          <a v-if="settings.vk_url" :href="settings.vk_url" title="ВКонтакте">
            <SocialIcon name="vk" />
          </a>
          <a v-if="settings.max_url" :href="settings.max_url" title="MAX">
            <SocialIcon name="max" />
          </a>
          <a v-if="settings.whatsapp_url" :href="settings.whatsapp_url" title="WhatsApp">
            <SocialIcon name="whatsapp" />
          </a>
        </div>

        <img
          v-if="paymentsSrc"
          class="f-pay"
          :src="paymentsSrc"
          alt="Принимаем к оплате"
          loading="lazy"
        />
      </div>

      <div v-if="legal.length" class="f-legal">
        <a v-for="m in legal" :key="m.id" :href="m.url">
          {{ m.label }}
          <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true">
            <path
              d="M0 5h16m0 0l-4-4m4 4l-4 4"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </a>
      </div>

      <div class="f-bot">
        <p v-if="settings.copyright">{{ settings.copyright }}</p>
        <p v-if="settings.legal_note" class="f-fine">{{ settings.legal_note }}</p>
      </div>
    </div>
  </footer>
</template>
