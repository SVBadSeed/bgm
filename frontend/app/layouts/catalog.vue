<script setup lang="ts">
  /*
   * Обёртка страниц каталога. Шапка не стоит на белом, а висит над фотографией
   * раздела — как на главной: страница начинается кадром, и белая полоса над
   * ним отрезала бы его от заголовка.
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
  <div class="page-shell is-over">
    <SiteHeader
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
