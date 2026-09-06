<script setup lang="ts">
  /* Весь каталог. Ничем не закреплён — фильтры выбирают целиком. */
  definePageMeta({ layout: 'catalog' })
</script>

<template>
  <CatalogView
    title="Туры и экскурсии"
    crumb="Туры и экскурсии"
    image="/demo/hero-kdr.webp"
    seo-description="Автобусные туры и экскурсии по югу России и Кавказу: фильтр по направлению, городу выезда, датам и цене."
  />
</template>
