<script setup lang="ts">
  /*
   * Страница направления: тот же каталог, но направление задано адресом.
   * Заголовок собирает CatalogView — он же дописывает город, если его выбрали.
   */
  definePageMeta({ layout: 'catalog' })

  const route = useRoute()
  const slug = computed(() => String(route.params.slug))

  const { data } = await useCatalog()
  const dest = computed(() =>
    data.value.destinations.find((d) => d.slug === slug.value),
  )

  /* Направления нет — это не «пустой список», а несуществующий адрес */
  if (!dest.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Направление не найдено',
      fatal: true,
    })
  }
</script>

<template>
  <CatalogView
    title="Туры и экскурсии"
    :crumb="dest?.name ?? ''"
    :image="dest?.image"
    :lock-destination="slug"
    :seo-description="`Автобусные туры в ${dest?.name}: расписание выездов, цены и программы от БогемаТур.`"
  />
</template>
