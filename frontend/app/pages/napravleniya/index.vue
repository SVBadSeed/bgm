<script setup lang="ts">
  /*
   * Все направления одной страницей. На главной их восемь плиток и строка
   * билетов под ними — остальные там просто некуда положить. Здесь лежат
   * все: и человеку есть куда провалиться, и поисковику есть что обойти.
   *
   * Порядок — тот же, что задан в админке сортировкой: менеджер решает,
   * что показывать первым, и на этой странице решение то же самое.
   *
   * Класс is-catalog у корня снимает верхний отступ страницы: шапка висит
   * над кадром, и без этого между ними оставалась белая полоса.
   */
  definePageMeta({ layout: 'catalog' })

  const { data } = await useCatalog()
  const { data: site } = await useLanding()

  const items = computed(() => data.value.destinations)

  useSeoMeta({
    title: 'Все направления — БогемаТур',
    description:
      'Куда мы возим: Кавказ, Крым, Абхазия, Золотое кольцо и другие направления автобусных туров и экскурсий БогемаТур.',
  })
</script>

<template>
  <div class="page is-catalog">
    <section class="chero dhero">
      <MediaSlot
        class="chero-photo"
        :image="site.landing.seo_image ?? '/demo/hero-kbr.webp'"
        alt=""
        loading="eager"
        :transform="{ width: 1920, quality: 70 }"
      />
      <div class="chero-in wrap">
        <h1 class="chero-h1">Все направления</h1>
        <p v-if="items.length" class="dall-count">
          {{ items.length }}
          {{ plural(items.length, 'направление', 'направления', 'направлений') }}
        </p>
      </div>
    </section>

    <div class="wrap">
      <nav class="crumbs">
        <NuxtLink to="/">Главная</NuxtLink>
        <span>Направления</span>
      </nav>

      <div v-if="items.length" class="dgrid dall">
        <DestinationCard v-for="d in items" :key="d.id" :item="d" />
      </div>
      <p v-else class="olist-empty">Направления скоро появятся.</p>
    </div>
  </div>
</template>
