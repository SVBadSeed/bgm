<script setup lang="ts">
  /*
   * Обёртка главной. Шапка живёт внутри страницы — она приколота к верху и
   * висит над кадром, поэтому второй, «липкой» панели здесь нет.
   */
  const { data } = await useLanding()
</script>

<template>
  <div>
    <slot />
    <ContactsDialog :settings="data.settings" />
    <SiteFooter
      :settings="data.settings"
      :menu="data.menu"
      :mascot="data.landing.mascot_full_image"
    />
  </div>
</template>
