<script setup lang="ts">
  /*
   * Карточка пакетного предложения. Разметка и классы — от карточки тура:
   * это одна и та же полка, и ряды в ней должны совпадать по высоте строк.
   * Отличается содержимым, потому что у отеля свои факты: звёзды, питание,
   * оценка гостей. Дат несколько не бывает — вылет один, поэтому и строка
   * с датами короче, чем у автобусного тура.
   */
  import type { ForeignOffer } from '~/types/schema'

  const props = defineProps<{ offer: ForeignOffer }>()

  const discount = computed(() => offerDiscount(props.offer))

  const place = computed(() =>
    [props.offer.country, props.offer.city].filter(Boolean).join(', '),
  )

  /* Ночи и питание — та же пара билетиков, что дни и ночи у тура */
  const pills = computed(() =>
    [nightsLabel(props.offer.nights), mealLabel(props.offer.meal)].filter(
      Boolean,
    ),
  )

  const date = computed(() =>
    props.offer.date_start ? formatDate(props.offer.date_start) : null,
  )

  /* «4,6» — запятая, как принято в русских оценках */
  const rating = computed(() => {
    const r = props.offer.rating
    return r ? r.toFixed(1).replace('.', ',') : null
  })

  const price = computed(() => formatPrice(props.offer.price))
</script>

<template>
  <a class="pcard ocard" :href="offer.url ?? '#'">
    <div class="pcard-media">
      <span v-if="discount" class="pcard-sale ticket">
        <svg width="13" height="14" viewBox="0 0 24 26" aria-hidden="true">
          <path
            fill="currentColor"
            d="M13.5 0c.7 4.2-1.2 6.6-3.4 8.8-2.3 2.3-4.9 4.4-4.9 8.4 0 4.5 3.4 8.1 7.6 8.1 4.6 0 8.2-3.4 8.2-8.4 0-3.2-1.4-5.6-2.8-7.6-.4 1.3-1.3 2.3-2.4 2.6.9-4.4-.6-9-2.3-11.9Z"
          />
          <path
            fill="#ffd166"
            d="M13 12.6c.5 2.2-.4 3.3-1.4 4.4-.9 1-1.9 2-1.9 3.6 0 1.9 1.5 3.4 3.4 3.4s3.4-1.5 3.4-3.6c0-2.4-2.1-4.4-3.5-7.8Z"
          />
        </svg>
        −{{ discount }}%
      </span>
      <FavoriteButton :id="offer.id" :title="offer.hotel" />
      <!-- Оценка на фото, а не в мете: по ней выбирают отель раньше, чем
           дочитывают название. -->
      <span v-if="rating" class="ocard-rate">
        <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2l3 6.6 7 .7-5.2 4.8 1.4 7-6.2-3.6L5.8 21l1.4-7L2 9.3l7-.7z"
          />
        </svg>
        {{ rating }}
      </span>
      <MediaSlot
        :image="offer.image"
        :alt="offer.hotel"
        :placeholder="offer.hotel"
        :transform="{ width: 600, height: 600 }"
      />
    </div>
    <h3 class="pcard-title">
      <span v-if="offer.stars" class="ocard-stars">{{ offer.stars }}★</span>
      {{ offer.hotel }}
    </h3>
    <div v-if="place" class="pcard-meta">
      <span>{{ place }}</span>
    </div>
    <div v-if="pills.length || date" class="pcard-facts">
      <div
        v-if="pills.length"
        class="pcard-pills"
        :class="{ 'ticket-pair': pills.length === 2 }"
      >
        <span
          v-for="(p, i) in pills"
          :key="p"
          class="dpill"
          :class="[i === 0 ? 'd1' : 'd2', pills.length === 1 ? 'ticket' : '']"
          >{{ p }}</span
        >
      </div>
      <p v-if="date" class="pcard-dates">
        <span class="pcard-dates-cap">вылет</span>
        <span class="pcard-date">{{ date }}</span>
      </p>
    </div>
    <div v-if="offer.price != null" class="pcard-price">
      <b>{{ price }}</b>
      <small v-if="offer.price_note">{{ offer.price_note }}</small>
    </div>
  </a>
</template>
