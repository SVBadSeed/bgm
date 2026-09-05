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
</script>

<template>
  <div>
    <div id="top" class="hero-band">
      <SiteHeader
        :menu="data.menu"
        :settings="data.settings"
        :destinations="data.destinations"
        :all-url="landing.destinations_all_url"
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
        id="excursions"
        :title="landing.excursions_title"
        :all-url="landing.excursions_all_url"
        :items="data.excursions"
      />

      <ToursRail
        id="tours"
        variant="shelf"
        :mascot="landing.mascot_image"
        :title="landing.tours_title"
        :all-url="landing.tours_all_url"
        :items="data.tours"
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

      <WhySection
        id="why"
        :title="landing.why_title"
        :items="data.advantages"
      />

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
