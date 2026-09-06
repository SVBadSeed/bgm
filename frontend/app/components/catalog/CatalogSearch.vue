<script setup lang="ts">
  /*
   * Крупный поиск в шапке каталога: откуда, куда, когда.
   *
   * В отличие от колонки слева он не применяет фильтр на каждое движение —
   * человек собирает запрос целиком и нажимает «Найти». Так на странице
   * направления можно спокойно выбрать город и месяц, не получив три
   * перерисовки выдачи по дороге.
   *
   * Поля показываются все три, даже если одно задано адресом страницы: на
   * «Турах в Карелию» в «Направлении» так и написано «Карелия» — это ответ на
   * вопрос «где я нахожусь», а сменить его тут же значит перейти в другой
   * раздел, а не спрятать поле.
   */
  import type { CatalogQuery } from '~/utils/catalogFilter'

  const props = defineProps<{
    cities: { value: string; label: string }[]
    destinations: { value: string; label: string }[]
    months: { value: string; label: string }[]
    query: CatalogQuery
  }>()

  const emit = defineEmits<{ search: [Partial<CatalogQuery>] }>()

  const draft = ref({
    city: [...(props.query.city ?? [])],
    destination: [...(props.query.destination ?? [])],
    month: [...(props.query.month ?? [])],
  })

  /* Фильтр могли поменять из колонки или кнопкой «назад» — черновик обязан
     показывать то же, что и выдача, иначе поля врут. */
  watch(
    () => [props.query.city, props.query.destination, props.query.month],
    ([city, destination, month]) => {
      draft.value = {
        city: [...(city ?? [])],
        destination: [...(destination ?? [])],
        month: [...(month ?? [])],
      }
    },
  )

  function submit() {
    emit('search', { ...draft.value })
  }
</script>

<template>
  <form class="csearch-panel" @submit.prevent="submit">
    <label class="csearch-field">
      <span>Город выезда</span>
      <SelectMenu
        v-model="draft.city"
        :options="cities"
        all-label="Любой город"
        multiple
      />
    </label>
    <label class="csearch-field">
      <span>Направление</span>
      <SelectMenu
        v-model="draft.destination"
        :options="destinations"
        all-label="Любое направление"
        multiple
      />
    </label>
    <label class="csearch-field">
      <span>Когда</span>
      <SelectMenu
        v-model="draft.month"
        :options="months"
        all-label="Любой месяц"
        multiple
      />
    </label>
    <button type="submit" class="csearch-go">Найти</button>
  </form>
</template>
