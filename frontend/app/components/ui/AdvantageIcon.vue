<script setup lang="ts">
  import type { AdvantageIcon } from '~/types/schema'

  defineProps<{ name: AdvantageIcon | string }>()
</script>

<template>
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0A0A0A"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'bus'">
      <path d="M5 5h14v10H5z" />
      <path d="M5 11h14" />
      <path d="M5 15v2h2v-2" />
      <path d="M17 15v2h2v-2" />
    </template>
    <template v-else-if="name === 'seat'">
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
      <path d="M12 14.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z" />
      <path d="M12 9.6V3.2" />
      <path d="M9.9 13.2 4.6 17" />
      <path d="M14.1 13.2l5.3 3.8" />
    </template>
    <template v-else-if="name === 'pin'">
      <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </template>
    <template v-else-if="name === 'shield'">
      <path d="M12 3l7 3v5c0 4.5-3 8.4-7 10-4-1.6-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </template>
    <template v-else-if="name === 'headset'">
      <path d="M4 13v-1a8 8 0 0116 0v1" />
      <path d="M4 13h2.4a1 1 0 011 1v3.6a1 1 0 01-1 1H5.4A1.4 1.4 0 014 17.2z" />
      <path d="M20 13h-2.4a1 1 0 00-1 1v3.6a1 1 0 001 1h1a1.4 1.4 0 001.4-1.4z" />
      <path d="M19 18.6v.6a2.2 2.2 0 01-2.2 2.2H13" />
    </template>
    <template v-else-if="name === 'diamond'">
      <path d="M7.2 3.5h9.6l3.7 5-8.5 12-8.5-12z" />
      <path d="M3 8.5h18" />
      <path d="M9.4 8.5 12 20.5l2.6-12-2.6-5z" />
    </template>
    <template v-else-if="name === 'plane'">
      <path d="M10.6 13.4 3 11l18-7-7 18-2.6-7.6z" />
      <path d="m10.6 13.4 4.6-4.6" />
    </template>
    <template v-else>
      <path
        d="M12 2l3 6.6 7 .7-5.2 4.8 1.4 7-6.2-3.6L5.8 21l1.4-7L2 9.3l7-.7z"
      />
    </template>
  </svg>
</template>
