<script setup lang="ts">
  /*
   * Сворачиваемая группа фильтров. Колонка с шестью развёрнутыми группами
   * длиннее выдачи, и до нижних приходится доскроллить — а сворачивать нужно
   * ровно то, чем в этот раз не пользуются.
   *
   * Содержимое не размонтируется, а прячется: состояние полей внутри должно
   * пережить сворачивание.
   */
  const props = withDefaults(
    defineProps<{ title: string; open?: boolean }>(),
    { open: true },
  )

  const open = ref(props.open)
</script>

<template>
  <section class="fgroup" :class="{ closed: !open }">
    <button
      type="button"
      class="fgroup-h"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span>{{ title }}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
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
    <div v-show="open" class="fgroup-body">
      <slot />
    </div>
  </section>
</template>
