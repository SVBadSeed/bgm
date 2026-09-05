<script setup lang="ts">
  const props = defineProps<{ id: string; title?: string }>()

  const { has, toggle } = useFavorites()
  const on = computed(() => has(props.id))
</script>

<template>
  <button
    class="fav"
    :class="{ on }"
    type="button"
    :aria-pressed="on"
    :title="on ? 'Убрать из избранного' : 'В избранное'"
    :aria-label="
      (on ? 'Убрать из избранного: ' : 'В избранное: ') + (title ?? 'тур')
    "
    @click.prevent.stop="toggle(id)"
  >
    <!-- То же сердце, что в шапке (Solar Heart Bold с bogema.ru): цвета
         задаёт CSS через currentColor, форма одна на весь сайт. -->
    <svg
      width="18"
      height="18"
      viewBox="0 0 25 25"
      stroke-width="2"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M17.9 3c-2.35 0-4.38 1.41-5.4 3.46C11.48 4.41 9.45 3 7.1 3 3.73 3 1 5.89 1 9.45c0 3.55 2.09 5.64 4.79 8.32C8.49 20.45 12.5 23 12.5 23s3.88-2.51 6.71-5.23C22.23 14.87 24 13.02 24 9.45 24 5.88 21.27 3 17.9 3Z" />
    </svg>
  </button>
</template>
