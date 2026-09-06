<script setup lang="ts">
  import type { Destination } from '~/types/schema'

  defineProps<{ item: Destination }>()
</script>

<template>
  <a class="dcard" :href="destinationUrl(item)">
    <MediaSlot
      :image="item.image"
      :alt="item.name"
      :placeholder="item.name"
      :transform="{ width: 640, height: 800 }"
    />
    <span v-if="item.kicker" class="dcard-kicker">{{ item.kicker }}</span>
    <h3 class="dcard-name">{{ item.name }}</h3>
    <div class="dcard-row">
      <small>{{ item.programs_label }}</small>
      <b v-if="item.price_from != null"
        >от {{ formatPrice(item.price_from) }}</b
      >
    </div>
  </a>
</template>
