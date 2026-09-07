<script setup lang="ts">
  /*
   * Шапка каталога: фото, заголовок, поиск и быстрые срезы.
   *
   * Одна и та же на «Все туры», «Туры из Краснодара» и «Туры в Дагестан» —
   * страницы отличаются только тем, какое поле уже заполнено. Быстрые чипы
   * дублируют часть колонки слева намеренно: сверху ими пользуются сразу, а
   * колонка нужна, когда запрос уточняют.
   */
  import type { ImageRef } from '~/types/schema'
  import type { CatalogQuery, LengthKey } from '~/utils/catalogFilter'

  const props = defineProps<{
    title: string
    image?: ImageRef
    /** «14 программ», «выезды из 4 городов» — факты, а не обещания */
    facts: string[]
    cities: { value: string; label: string }[]
    destinations: { value: string; label: string }[]
    months: { value: string; label: string }[]
    /** Даты выездов для календаря в поиске */
    days: string[]
    query: CatalogQuery
    /** Соседние срезы каталога под поиском */
    popular: { key: string; label: string; count: number; url: string }[]
  }>()

  const emit = defineEmits<{
    /** Быстрый срез: остаёмся на странице */
    refine: [Partial<CatalogQuery>]
    /** «Найти»: город и направление могут увести в другой раздел */
    submit: [Partial<CatalogQuery>]
  }>()

  const TYPES: { value: CatalogQuery['type']; label: string; hot?: boolean }[] =
    [
      { value: null, label: 'Все' },
      { value: 'hot', label: 'Горящие', hot: true },
      { value: 'new', label: 'Новые' },
    ]

  const LENGTHS: { value: LengthKey; label: string }[] = [
    { value: '1', label: 'На 1 день' },
    { value: '2', label: 'На 2 дня' },
    { value: '3', label: 'На 3 дня' },
    { value: 'ot4', label: 'От 4 дней' },
  ]

  const lengthOn = (v: LengthKey) => (props.query.length ?? []).includes(v)

  function toggleLength(v: LengthKey) {
    const now = props.query.length ?? []
    emit('refine', {
      length: now.includes(v) ? now.filter((x) => x !== v) : [...now, v],
    })
  }
</script>

<template>
  <section class="chero">
    <MediaSlot
      class="chero-photo"
      :image="image"
      :alt="title"
      loading="eager"
      :transform="{ width: 1920, quality: 70 }"
    />
    <div class="chero-in wrap">
      <h1 class="chero-h1">{{ title }}</h1>
      <ul v-if="facts.length" class="chero-facts">
        <li v-for="f in facts" :key="f">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="11" fill="#b8f24e" />
            <path
              d="M7 12.4l3.3 3.2L17 9"
              fill="none"
              stroke="#0a0a0a"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {{ f }}
        </li>
      </ul>

      <CatalogSearch
        :cities="cities"
        :destinations="destinations"
        :months="months"
        :days="days"
        :query="query"
        @search="emit('submit', $event)"
      />

      <div class="chero-quick">
        <div class="chero-types">
          <button
            v-for="t in TYPES"
            :key="t.label"
            type="button"
            class="qchip"
            :class="{ on: (query.type ?? null) === t.value, hot: t.hot }"
            @click="emit('refine', { type: t.value })"
          >
            <svg
              v-if="t.hot"
              width="12"
              height="13"
              viewBox="0 0 24 26"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M13.5 0c.7 4.2-1.2 6.6-3.4 8.8-2.3 2.3-4.9 4.4-4.9 8.4 0 4.5 3.4 8.1 7.6 8.1 4.6 0 8.2-3.4 8.2-8.4 0-3.2-1.4-5.6-2.8-7.6-.4 1.3-1.3 2.3-2.4 2.6.9-4.4-.6-9-2.3-11.9Z"
              />
            </svg>
            {{ t.label }}
          </button>
        </div>
        <button
          v-for="l in LENGTHS"
          :key="l.value"
          type="button"
          class="qchip"
          :class="{ on: lengthOn(l.value) }"
          @click="toggleLength(l.value)"
        >
          {{ l.label }}
        </button>
      </div>

      <div v-if="popular.length" class="chero-pop">
        <span class="chero-pop-cap">Популярное:</span>
        <div class="chero-pop-list">
          <NuxtLink v-for="p in popular" :key="p.key" :to="p.url" class="pchip">
            {{ p.label }}<b>{{ p.count }}</b>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
