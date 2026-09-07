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
            :href="settings.phone_href ?? `tel:${settings.phone}`"
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
