<script setup lang="ts">
  const { data } = await useLanding()
</script>

<template>
  <div>
    <StickyBar
      :menu="data.menu"
      :settings="data.settings"
      :search-placeholder="data.landing.hero_search_placeholder"
      :destinations="data.destinations"
      :cities="data.departureCities"
      :all-url="data.landing.destinations_all_url"
    />
    <slot />
    <SiteFooter
      :settings="data.settings"
      :menu="data.menu"
      :mascot="data.landing.mascot_full_image"
    />
  </div>
</template>
