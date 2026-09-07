<script setup lang="ts">
  /*
   * Крупный поиск в шапке каталога: откуда, куда, когда.
   *
   * Поля показываются все три, даже если одно задано адресом страницы: на
   * «Турах в Карелию» в «Направлении» так и написано «Карелия» — это ответ на
   * вопрос «где я нахожусь».
   *
   * Каждое поле применяется сразу. Раньше здесь был черновик и кнопка «Найти»,
   * и это расходилось с тем, что видно: человек убирал направление, а заголовок
   * оставался «Туры в Кабардино-Балкарию», пока он не нажмёт кнопку. Кнопка
   * осталась, но теперь она подтверждает уже применённый запрос, а не хранит
   * его у себя.
   */
  import type { CatalogQuery } from '~/utils/catalogFilter'

  const props = defineProps<{
    cities: { value: string; label: string }[]
    destinations: { value: string; label: string }[]
    months: { value: string; label: string }[]
    /** Даты, в которые есть выезды: по ним живёт календарь */
    days: string[]
    query: CatalogQuery
  }>()

  const emit = defineEmits<{ search: [Partial<CatalogQuery>] }>()

  const value = computed(() => ({
    city: props.query.city ?? [],
    destination: props.query.destination ?? [],
    month: props.query.month ?? [],
    from: props.query.from ?? null,
    to: props.query.to ?? null,
  }))

  function pick(field: 'city' | 'destination', next: unknown) {
    emit('search', { ...value.value, [field]: next as string[] })
  }

  /* «Когда» отвечает сразу тремя полями: месяцами или отрезком дат */
  function when(next: { month: string[]; from: string | null; to: string | null }) {
    emit('search', { ...value.value, ...next })
  }
</script>

<template>
  <form class="csearch-panel" @submit.prevent="emit('search', value)">
    <div class="csearch-field">
      <span>Город выезда</span>
      <SelectMenu
        :model-value="value.city"
        :options="cities"
        all-label="Любой город"
        multiple
        @update:model-value="pick('city', $event)"
      />
    </div>
    <div class="csearch-field">
      <span>Направление</span>
      <SelectMenu
        :model-value="value.destination"
        :options="destinations"
        all-label="Любое направление"
        multiple
        @update:model-value="pick('destination', $event)"
      />
    </div>
    <div class="csearch-field">
      <span>Когда</span>
      <WhenPicker
        :months="months"
        :days="days"
        :month="value.month"
        :from="value.from"
        :to="value.to"
        @change="when"
      />
    </div>
    <button type="submit" class="csearch-go">Найти</button>
  </form>
</template>
