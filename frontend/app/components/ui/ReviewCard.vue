<script setup lang="ts">
  import type { Review } from '~/types/schema'

  const props = defineProps<{ review: Review }>()

  const tour = computed(() =>
    props.review.tour && typeof props.review.tour === 'object'
      ? props.review.tour
      : null,
  )
  const stars = computed(() =>
    Math.max(0, Math.min(5, props.review.rating ?? 5)),
  )
  const assetUrl = useAssetUrl()
  const tourImg = computed(() =>
    assetUrl(tour.value?.image, { width: 120, height: 120 }),
  )
</script>

<template>
  <div class="rev">
    <div class="rev-top">
      <span class="rev-ava blob">{{ initials(review.author) }}</span>
      <span>
        <b>{{ review.author }}</b>
        <small v-if="review.meta">{{ review.meta }}</small>
      </span>
    </div>
    <div class="stars" :aria-label="`Оценка ${stars} из 5`">
      <svg
        v-for="i in stars"
        :key="i"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="#B8F24E"
      >
        <path
          d="M12 2l3 6.6 7 .7-5.2 4.8 1.4 7-6.2-3.6L5.8 21l1.4-7L2 9.3l7-.7z"
        />
      </svg>
    </div>
    <p>{{ review.text }}</p>
    <div v-if="tour" class="rev-ref">
      <img
        v-if="tourImg"
        class="rr-media"
        :src="tourImg"
        alt=""
        loading="lazy"
      />
      <span v-else class="rr-media"></span>
      <span>
        {{ tour.title }}
        <small v-if="tour.place_label">{{ tour.place_label }}</small>
      </span>
    </div>
  </div>
</template>
