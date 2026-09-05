<script setup lang="ts">
  import type { Tour } from '~/types/schema'

  const props = defineProps<{ tour: Tour }>()

  // «3 дня / 2 ночи» → две пилюли; «9 часов» → одна. Так длительность
  // считывается с одного взгляда, а не тонет в серой мета-строке.
  const durationParts = computed(() =>
    (props.tour.duration_label ?? '')
      .split('/')
      .map((p) => p.trim())
      .filter(Boolean),
  )

  const price = computed(() => {
    const p = formatPrice(props.tour.price_from)
    return props.tour.price_prefix ? `${props.tour.price_prefix} ${p}` : p
  })
</script>

<template>
  <a class="pcard" :href="tour.url ?? '#'">
    <div class="pcard-media">
      <span v-if="tour.tag" class="pcard-tag ticket">{{ tour.tag }}</span>
      <FavoriteButton :id="tour.id" :title="tour.title" />
      <MediaSlot
        :image="tour.image"
        :alt="tour.title"
        :placeholder="tour.title"
        :transform="{ width: 600, height: 600 }"
      />
    </div>
    <h3 class="pcard-title">{{ tour.title }}</h3>
    <div v-if="tour.place_label" class="pcard-meta">
      <span>{{ tour.place_label }}</span>
    </div>
    <div
      v-if="durationParts.length"
      class="pcard-pills"
      :class="{ 'ticket-pair': durationParts.length === 2 }"
    >
      <!-- Одиночная длительность тоже билет: в паре форму даёт .ticket-pair,
           а одна половинка иначе осталась бы обычной пилюлей. -->
      <span
        v-for="(part, i) in durationParts"
        :key="part"
        class="dpill"
        :class="[
          i === 0 ? 'd1' : 'd2',
          durationParts.length === 1 ? 'ticket' : '',
        ]"
        >{{ part }}</span
      >
    </div>
    <div v-if="tour.price_from != null" class="pcard-price">
      <b>{{ price }}</b>
      <small v-if="tour.price_note">{{ tour.price_note }}</small>
    </div>
  </a>
</template>
