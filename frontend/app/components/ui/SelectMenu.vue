<script setup lang="ts">
  /*
   * Выпадающий список для фильтров. Не <select> потому, что системный список
   * на десктопе рисуется шрифтом ОС и выбивается из панели, а множественный
   * выбор в нём — это ctrl+клик, о котором никто не догадается.
   *
   * Пустое значение — это «все»: отдельным пунктом сверху, как у Ярко.
   * В режиме multiple список не закрывается после выбора: отмечают обычно
   * несколько городов подряд, и закрытие после каждого — лишние клики.
   */
  const props = withDefaults(
    defineProps<{
      /** Строка в обычном режиме, массив слагов — в multiple */
      modelValue: string | string[] | null
      options: { value: string; label: string }[]
      /** Подпись пункта «сбросить» и текст кнопки, когда ничего не выбрано */
      allLabel: string
      multiple?: boolean
    }>(),
    { multiple: false },
  )

  const emit = defineEmits<{
    'update:modelValue': [string | string[] | null]
  }>()

  const open = ref(false)
  const root = ref<HTMLElement | null>(null)

  const selected = computed<string[]>(() => {
    const v = props.modelValue
    if (Array.isArray(v)) return v
    return v ? [v] : []
  })

  const labelOf = (value: string) =>
    props.options.find((o) => o.value === value)?.label ?? value

  /* «Краснодар +2»: перечислять все выбранные некуда — кнопка в одну строку */
  const current = computed(() => {
    const s = selected.value
    if (!s.length) return null
    const first = labelOf(s[0] as string)
    return s.length > 1 ? `${first} +${s.length - 1}` : first
  })

  const isOn = (value: string) => selected.value.includes(value)

  function pick(value: string | null) {
    if (!props.multiple) {
      emit('update:modelValue', value)
      open.value = false
      return
    }
    if (value == null) {
      emit('update:modelValue', [])
      open.value = false
      return
    }
    emit(
      'update:modelValue',
      isOn(value)
        ? selected.value.filter((v) => v !== value)
        : [...selected.value, value],
    )
  }

  /* Клик мимо и Esc закрывают: без этого список остаётся висеть над карточками */
  function onDocClick(e: MouseEvent) {
    if (open.value && !root.value?.contains(e.target as Node)) open.value = false
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') open.value = false
  }
  onMounted(() => {
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('click', onDocClick)
    document.removeEventListener('keydown', onKey)
  })
</script>

<template>
  <div ref="root" class="selm" :class="{ open, multi: multiple }">
    <button
      type="button"
      class="selm-btn"
      :class="{ chosen: !!current }"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span>{{ current ?? allLabel }}</span>
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
    <Transition name="selm">
      <div v-if="open" class="selm-list">
      <button
        type="button"
        class="selm-opt"
        :class="{ on: !selected.length }"
        @click="pick(null)"
      >
        <i v-if="multiple" class="selm-box" aria-hidden="true"></i>
        {{ allLabel }}
      </button>
      <button
        v-for="o in options"
        :key="o.value"
        type="button"
        class="selm-opt"
        :class="{ on: isOn(o.value) }"
        @click="pick(o.value)"
      >
        <i v-if="multiple" class="selm-box" aria-hidden="true">
          <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M5 12.5l4.5 4.5L19 7"
              fill="none"
              stroke="currentColor"
              stroke-width="3.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </i>
        {{ o.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>
