<script setup lang="ts">
  defineProps<{ atStart: boolean; atEnd: boolean }>()
  const emit = defineEmits<{ prev: []; next: [] }>()
</script>

<template>
  <div class="arrows">
    <button
      class="arw"
      type="button"
      aria-label="Назад"
      :disabled="atStart"
      @click="emit('prev')"
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M14 6l-6 6 6 6" />
      </svg>
    </button>
    <button
      class="arw"
      type="button"
      aria-label="Вперёд"
      :disabled="atEnd"
      @click="emit('next')"
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M10 6l6 6-6 6" />
      </svg>
    </button>
  </div>
</template>
