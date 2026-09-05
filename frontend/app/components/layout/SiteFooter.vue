<script setup lang="ts">
  import type {
    ImageRef,
    MenuItem,
    MenuPlacement,
    SiteSettings,
  } from '~/types/schema'

  const props = withDefaults(
    defineProps<{
      menu: MenuItem[]
      settings: SiteSettings
      mascot?: ImageRef
    }>(),
    { mascot: null },
  )

  const assetUrl = useAssetUrl()
  const mascotSrc = computed(() =>
    assetUrl(props.mascot, { width: 900, format: 'webp' }),
  )

  const group = (p: MenuPlacement) =>
    props.menu.filter((m) => m.placement === p)
  const travel = computed(() => group('footer_travel'))
  const company = computed(() => group('footer_company'))
  const legal = computed(() => group('footer_legal'))
</script>

<template>
  <footer class="lp-footer">
    <!-- Барс сидит на границе лаймового полотна и футера. Пока картинки нет,
         блок не рисуется: рисовать вектор в полный рост смысла нет. -->
    <img v-if="mascotSrc" class="footer-mascot" :src="mascotSrc" alt="" />
    <div class="wrap">
      <div class="f-grid">
        <div class="f-col">
          <BrandLogo :name="settings.brand_name" />
          <p v-if="settings.about" class="f-about">{{ settings.about }}</p>
        </div>

        <div class="f-col">
          <h4>Путешественникам</h4>
          <div class="f-links">
            <a v-for="m in travel" :key="m.id" :href="m.url">{{ m.label }}</a>
          </div>
        </div>

        <div class="f-col">
          <h4>Компания</h4>
          <div class="f-links">
            <a v-for="m in company" :key="m.id" :href="m.url">{{ m.label }}</a>
          </div>
        </div>

        <div class="f-col">
          <h4>Связаться</h4>
          <a
            v-if="settings.phone"
            class="f-tel"
            :href="`tel:${settings.phone_href ?? settings.phone}`"
          >
            {{ settings.phone }}
          </a>
          <div v-if="settings.email" class="f-mail">
            <a :href="`mailto:${settings.email}`">{{ settings.email }}</a>
          </div>
          <div v-if="settings.address" class="f-mail">
            {{ settings.address }}
          </div>
          <div class="socials">
            <a v-if="settings.vk_url" :href="settings.vk_url" title="ВКонтакте">
              <svg width="19" height="19" viewBox="0 0 24 24">
                <path
                  d="M12.8 16.4c-5 0-8-3.5-8.1-9.2h2.6c.1 4.2 2 6 3.4 6.4V7.2h2.5v3.7c1.4-.2 2.8-1.7 3.3-3.7h2.5a6.6 6.6 0 01-3 4.3 6.8 6.8 0 013.5 4.3h-2.7c-.4-1.5-1.7-2.7-3.6-2.9v2.9z"
                />
              </svg>
            </a>
            <a
              v-if="settings.telegram_url"
              :href="settings.telegram_url"
              title="Telegram"
            >
              <svg width="19" height="19" viewBox="0 0 24 24">
                <path
                  d="M21 4.5L3.6 11.2c-.9.3-.9 1.5 0 1.8l4 1.3 1.5 4.7c.2.7 1 .9 1.5.4l2.2-2.1 4.3 3.2c.6.4 1.4.1 1.6-.6l3-14c.2-.9-.7-1.6-1.7-1.4zM9.6 14.2l8-5-6.5 6.2-.3 3-1.2-4.2z"
                />
              </svg>
            </a>
            <a
              v-if="settings.whatsapp_url"
              :href="settings.whatsapp_url"
              title="WhatsApp"
            >
              <svg width="19" height="19" viewBox="0 0 24 24">
                <path
                  d="M12 3a9 9 0 00-7.7 13.6L3 21l4.5-1.2A9 9 0 1012 3zm0 2a7 7 0 013.9 12.8l-.5.3-2.9.8.8-2.6-.3-.5A7 7 0 0112 5zm-2.3 3.4c-.2 0-.5.1-.7.3-.3.3-.6.8-.6 1.5 0 .8.5 1.7 1.5 2.8 1 1.1 2 1.7 2.9 1.9.7.1 1.2 0 1.5-.3.3-.2.4-.6.4-.9v-.4l-1.5-.7-.6.7c-.1.1-.3.2-.5.1-.5-.2-1-.6-1.4-1-.4-.5-.7-.9-.8-1.3 0-.2 0-.4.2-.5l.6-.5-.6-1.4-.4-.1z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div class="f-bot">
        <span>{{ settings.copyright }}</span>
        <div class="f-legal">
          <a v-for="m in legal" :key="m.id" :href="m.url">{{ m.label }}</a>
        </div>
      </div>
    </div>
  </footer>
</template>
