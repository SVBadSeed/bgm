<script setup lang="ts">
  /*
   * Двойной ползунок «от — до». Два обычных input[type=range] друг над другом:
   * нативный элемент даёт клавиатуру, шаг и попадание пальцем без своей
   * реализации перетаскивания.
   *
   * Значение наружу отдаём по отпусканию (change), а не на каждое движение:
   * фильтр пишется в адрес, и на «input» история заполнилась бы сотней шагов.
   */
  const props = defineProps<{
    min: number
    max: number
    step: number
    from: number | null
    to: number | null
  }>()

  const emit = defineEmits<{ change: [from: number | null, to: number | null] }>()

  const a = ref(props.from ?? props.min)
  const b = ref(props.to ?? props.max)

  watch(
    () => [props.from, props.to, props.min, props.max],
    () => {
      a.value = props.from ?? props.min
      b.value = props.to ?? props.max
    },
  )

  /* Ручки не должны перепрыгивать друг друга: тянем ту, что двигают */
  function onA() {
    if (a.value > b.value) a.value = b.value
  }
  function onB() {
    if (b.value < a.value) b.value = a.value
  }

  function commit() {
    emit(
      'change',
      a.value > props.min ? a.value : null,
      b.value < props.max ? b.value : null,
    )
  }

  const pct = (v: number) =>
    props.max === props.min ? 0 : ((v - props.min) / (props.max - props.min)) * 100

  const style = computed(() => ({
    '--a': `${pct(a.value)}%`,
    '--b': `${pct(b.value)}%`,
  }))
</script>

<template>
  <div class="rng" :style="style">
    <span class="rng-track"></span>
    <span class="rng-fill"></span>
    <input
      v-model.number="a"
      class="rng-in"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      aria-label="От"
      @input="onA"
      @change="commit"
    />
    <input
      v-model.number="b"
      class="rng-in"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      aria-label="До"
      @input="onB"
      @change="commit"
    />
  </div>
</template>
