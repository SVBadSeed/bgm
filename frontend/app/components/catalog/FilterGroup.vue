<script setup lang="ts">
  /*
   * Сворачиваемая группа фильтров. Колонка с шестью развёрнутыми группами
   * длиннее выдачи, и до нижних приходится доскроллить — а сворачивать нужно
   * ровно то, чем в этот раз не пользуются.
   *
   * Содержимое не размонтируется и не выключается display:none, а зажимается
   * строкой сетки от 1fr к 0fr — так раскрытие можно анимировать, и состояние
   * полей внутри переживает сворачивание.
   *
   * Сброс живёт у каждой группы: убрать один ноябрь проще там же, где его и
   * выбрали, а не искать его в общем списке выбранного.
   */
  const props = withDefaults(
    defineProps<{ title: string; open?: boolean; active?: boolean }>(),
    { open: true, active: false },
  )

  defineEmits<{ clear: [] }>()

  const open = ref(props.open)

  /*
   * Подрезать содержимое нужно только пока строка сетки едет: иначе оно
   * вылезает поверх соседних групп. Когда группа раскрыта и стоит на месте,
   * подрезать нельзя — список городов рисуется абсолютом ниже своей кнопки,
   * и обрезка резала его по высоте группы. Снаружи это выглядело так, будто
   * список вообще не раскрывается: под полем показывалась одна полоска.
   */
  const moving = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  function toggle() {
    open.value = !open.value
    moving.value = true
    clearTimeout(timer)
    /* Чуть дольше, чем сама анимация (--t-move: 420ms) */
    timer = setTimeout(() => (moving.value = false), 460)
  }

  onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <section class="fgroup" :class="{ closed: !open, moving }">
    <div class="fgroup-h">
      <button type="button" class="fgroup-t" @click="toggle">
        {{ title }}
      </button>
      <button
        v-if="active"
        type="button"
        class="fgroup-clear"
        @click="$emit('clear')"
      >
        Сбросить
      </button>
      <button
        type="button"
        class="fgroup-x"
        :aria-expanded="open"
        :aria-label="open ? 'Свернуть' : 'Развернуть'"
        @click="toggle"
      >
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
    </div>
    <div class="fgroup-body" :inert="!open">
      <div class="fgroup-in">
        <slot />
      </div>
    </div>
  </section>
</template>
