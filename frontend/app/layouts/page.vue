<script setup lang="ts">
  /*
   * Обёртка внутренних страниц. Отличие от главной одно: шапка не висит над
   * фотографией, а стоит на белом — поэтому у неё свой набор цветов, а липкая
   * панель не нужна, она и так на месте.
   */
  const { data } = await useLanding()

  /* Ссылка на политику берётся из юридического меню футера: отдельное поле
     под неё заводить не за чем, менеджер правит меню в одном месте. */
  const policyUrl = computed(
    () =>
      data.value.menu.find(
        (m) => m.placement === 'footer_legal' && /политик/i.test(m.label),
      )?.url ?? '#',
  )
</script>

<template>
  <div class="page-shell">
    <SiteHeader
      class="is-solid"
      :menu="data.menu"
      :settings="data.settings"
      :destinations="data.destinations"
      :cities="data.departureCities"
      :all-url="data.landing.destinations_all_url"
    />
    <main class="lp-main">
      <slot />
      <LeadSection
        id="lead"
        :title="data.landing.lead_title"
        :subtitle="data.landing.lead_subtitle"
        :note="data.landing.lead_note"
        :success-text="data.landing.lead_success"
        :settings="data.settings"
        :policy-url="policyUrl"
      />
    </main>
    <SiteFooter
      :settings="data.settings"
      :menu="data.menu"
      :mascot="data.landing.mascot_full_image"
    />
  </div>
</template>
