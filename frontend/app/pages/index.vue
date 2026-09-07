<script setup lang="ts">
  const { data } = await useLanding()
  const assetUrl = useAssetUrl()
  const { public: pub } = useRuntimeConfig()

  const landing = computed(() => data.value.landing)

  useSeoMeta({
    title: () => landing.value.seo_title ?? 'БогемаТур',
    description: () => landing.value.seo_description ?? '',
    ogTitle: () => landing.value.seo_title ?? 'БогемаТур',
    ogDescription: () => landing.value.seo_description ?? '',
    ogImage: () =>
      assetUrl(landing.value.seo_image, { width: 1200, height: 630 }) ??
      undefined,
    ogUrl: pub.siteUrl,
    ogType: 'website',
  })

  /* Ссылка на политику берётся из юридического меню футера: отдельное поле
     под неё заводить не за чем, менеджер правит меню в одном месте. */
  const policyUrl = computed(
    () =>
      data.value.menu.find(
        (m) =>
          m.placement === 'footer_legal' && /политик/i.test(m.label),
      )?.url ?? '#',
  )

  /* «Ближайшие туры» — не отдельная выборка, а те же карточки, отсортированные
     по дате ближайшего выезда. Форматы смешаны намеренно: человеку, который
     смотрит «что скоро», неважно, экскурсия это или многодневный тур. */
  /* Горящие — те, у кого в админке проставлена цена до скидки. Отдельная
     секция, а не бейдж в общей ленте: за скидками приходят целенаправленно. */
  const hot = computed(() =>
    hotTours(
      [...data.value.excursions, ...data.value.tours],
      data.value.departures,
    ).slice(0, 8),
  )

  /* Преимущества общие для всех страниц, поэтому берём только свои: у
     карточек зарубежной страницы своя страница и свой блок. */
  const advantages = computed(() =>
    data.value.advantages.filter((a) => a.page !== 'foreign'),
  )

  const soonest = computed(() =>
    nearestFirst(
      [...data.value.excursions, ...data.value.tours],
      data.value.departures,
    ).slice(0, 8),
  )
</script>

<template>
  <div>
    <div id="top" class="hero-band">
      <SiteHeader
        float
        search
        :menu="data.menu"
        :settings="data.settings"
        :destinations="data.destinations"
        :cities="data.departureCities"
        :all-url="landing.destinations_all_url"
        :search-placeholder="landing.hero_search_placeholder"
      />
      <HeroSection
        :slides="data.heroSlides"
        :title="landing.hero_title"
        :placeholder="landing.hero_search_placeholder"
      />
    </div>

    <main class="lp-main">
      <PromoSection
        :title="landing.promo_title"
        :accent="landing.promo_accent"
        :button-label="landing.promo_button_label"
        :button-url="landing.promo_button_url"
        :image="landing.promo_image"
      />

      <ToursRail
        v-if="hot.length"
        id="hot"
        variant="hot"
        :title="landing.hot_title"
        :all-url="landing.hot_all_url"
        :items="hot"
        :departures="data.departures"
      />

      <ToursRail
        id="excursions"
        :title="landing.excursions_title"
        :all-url="landing.excursions_all_url"
        :items="soonest"
        :departures="data.departures"
      />

      <ToursRail
        id="tours"
        variant="shelf"
        :mascot="landing.mascot_image"
        :title="landing.tours_title"
        :all-url="landing.tours_all_url"
        :items="data.tours"
        :departures="data.departures"
      />

      <DestinationsGrid
        id="dests"
        :title="landing.destinations_title"
        :all-url="landing.destinations_all_url"
        :items="data.destinations"
      />

      <ReviewsSection
        id="revs"
        :title="landing.reviews_title"
        :badge="landing.reviews_badge"
        :subtitle="landing.reviews_subtitle"
        :all-url="landing.reviews_all_url"
        :items="data.reviews"
      />

      <WhySection id="why" :title="landing.why_title" :items="advantages" />

      <LeadSection
        id="lead"
        :title="landing.lead_title"
        :subtitle="landing.lead_subtitle"
        :note="landing.lead_note"
        :success-text="landing.lead_success"
        :settings="data.settings"
        :policy-url="policyUrl"
      />
    </main>
  </div>
</template>
