<script setup lang="ts">
  /*
   * Страница города выезда: каталог, отфильтрованный по месту посадки.
   * Заголовок собирает CatalogView — он же дописывает направление, если его
   * выбрали в «Популярном».
   */
  definePageMeta({ layout: 'catalog' })

  const route = useRoute()
  const slug = computed(() => String(route.params.slug))

  const { data } = await useCatalog()
  const city = computed(() =>
    data.value.cities.find((c) => c.slug === slug.value),
  )

  if (!city.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Город выезда не найден',
      fatal: true,
    })
  }
</script>

<template>
  <CatalogView
    title="Туры и экскурсии"
    :crumb="city?.name ?? ''"
    image="/demo/hero-kdr.webp"
    :lock-city="slug"
    :seo-description="`Автобусные туры и экскурсии с посадкой в городе ${city?.name}: расписание и цены.`"
  />
</template>
