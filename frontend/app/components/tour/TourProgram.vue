<script setup lang="ts">
  /*
   * Программа по дням — белыми карточками с бейджем «День N», как на старом
   * сайте. Раскрываются по клику; первый день открыт, с него и читают.
   *
   * Номер дня считаем по порядку, а не храним в заголовке: если день вставят
   * в середину, нумерация поедет сама и в админке ничего править не нужно.
   *
   * Анимация та же, что у групп фильтров: строка сетки едет от 0fr к 1fr,
   * поэтому высоту содержимого мерить не приходится.
   */
  import type { TourDay } from '~/types/schema'

  const props = defineProps<{
    days: TourDay[]
    /** Ссылка на буклет, если он есть */
    bookletUrl?: string | null
  }>()

  const open = ref<Set<string>>(new Set())
  watch(
    () => props.days,
    (list) => {
      const first = list[0]
      open.value = new Set(first ? [first.id] : [])
    },
    { immediate: true },
  )

  const isOpen = (id: string) => open.value.has(id)
  function toggle(id: string) {
    const next = new Set(open.value)
    if (!next.delete(id)) next.add(id)
    open.value = next
  }
</script>

<template>
  <div class="tprog">
    <a v-if="bookletUrl" class="tprog-booklet" :href="bookletUrl" download>
      <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 19h16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.9"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Скачать буклет
    </a>

    <div
      v-for="(d, i) in days"
      :key="d.id"
      class="tday"
      :class="{ open: isOpen(d.id) }"
    >
      <button type="button" class="tday-head" @click="toggle(d.id)">
        <span class="tday-num ticket">День {{ i + 1 }}</span>
        <span class="tday-title">{{ d.title }}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div class="tday-body">
        <div class="tday-in">
          <p v-if="d.text">{{ d.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
