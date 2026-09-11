<script setup lang="ts">
  /*
   * Зарубежные туры. Подбор ведёт партнёрский модуль — его код вставляют в
   * админке; наша часть — обвязка вокруг него: кадр с заголовком, витрина
   * предложений и ответ на вопрос «почему бронировать здесь, а не в поиске».
   */
  definePageMeta({ layout: 'catalog' })

  const { data } = await useForeign()
  const { data: site } = await useLanding()
  const assetUrl = useAssetUrl()
  const { public: pub } = useRuntimeConfig()

  const page = computed(() => data.value.page)

  const facts = computed(() =>
    (page.value.facts ?? '')
      .split('|')
      .map((f) => f.trim())
      .filter(Boolean),
  )

  const offers = computed(() => hotOffers(data.value.offers))

  /* Преимущества — общая коллекция, помеченные этой страницей */
  const perks = computed(() =>
    site.value.advantages.filter((a) => a.page === 'foreign'),
  )

  useSeoMeta({
    title: () => page.value.seo_title ?? page.value.title ?? 'Туры за границу',
    description: () => page.value.seo_description ?? '',
    ogTitle: () => page.value.seo_title ?? page.value.title ?? '',
    ogDescription: () => page.value.seo_description ?? '',
    ogImage: () =>
      assetUrl(page.value.image, { width: 1200, height: 630 }) ?? undefined,
    ogUrl: `${pub.siteUrl}/zarubezhnye-tury`,
    ogType: 'website',
  })
</script>

<template>
  <div class="zpage">
    <section class="chero zhero">
      <MediaSlot
        class="chero-photo"
        :image="page.image"
        alt=""
        loading="eager"
        :transform="{ width: 1920, quality: 70 }"
      />
      <div class="chero-in wrap">
        <h1 class="chero-h1">{{ page.title }}</h1>
        <ul v-if="facts.length" class="chero-facts">
          <li v-for="f in facts" :key="f">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="11" fill="var(--lime)" />
              <path
                d="M7 12.4l3.3 3.2L17 9"
                fill="none"
                stroke="var(--on-bright)"
                stroke-width="2.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ f }}
          </li>
        </ul>
      </div>
    </section>

    <div class="wrap">
      <nav class="crumbs">
        <NuxtLink to="/">Главная</NuxtLink>
        <span>Туры за границу</span>
      </nav>
    </div>

    <!-- Модуль подбора: пока код не вставлен, места он не занимает — пустая
         рамка-заглушка на боевой странице выглядела бы недоделкой. -->
    <section v-if="page.widget_code" id="podbor" class="zwidget">
      <div class="wrap">
        <EmbedSlot :code="page.widget_code" />
      </div>
    </section>

    <!-- Горящие: если партнёрский модуль подключён, показываем его — цены там
         живые. Пока кода нет, работает своя витрина из админки, чтобы раздел
         не стоял пустым. -->
    <section v-if="page.hot_code" id="hot-offers" class="sec">
      <div class="wrap">
        <div class="sec-head">
          <h2 class="sec-h2">{{ page.hot_title }}</h2>
        </div>
        <EmbedSlot :code="page.hot_code" />
      </div>
    </section>
    <OffersRail
      v-else
      id="hot-offers"
      :title="page.hot_title"
      :all-url="page.hot_all_url"
      :items="offers"
    />

    <PerkCards id="why-foreign" :title="page.perks_title" :items="perks" />
  </div>
</template>
