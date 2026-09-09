<script setup lang="ts">
  /*
   * Карточка цены. Едет вместе со страницей: программа длинная, а решение
   * принимают, дочитав до дат, — и кнопка должна быть под рукой в любой
   * момент, а не только в самом верху.
   *
   * Порядок строк тот же, что на старом сайте: цена, льготная цена, города
   * сбора, две оговорки про индивидуальный выезд и отмену, кнопки, предоплата.
   */
  import type { DepartureCity, SiteSettings, Tour } from '~/types/schema'

  const props = defineProps<{
    tour: Tour
    settings: SiteSettings
    /** Города, из которых этот тур действительно уходит */
    cities: DepartureCity[]
  }>()

  const emit = defineEmits<{ book: [] }>()

  const price = computed(() =>
    props.tour.price_from ? formatPrice(props.tour.price_from) : null,
  )
  const cityLine = computed(() =>
    props.cities.map((c) => c.name).join(', '),
  )
</script>

<template>
  <aside class="tbuy">
    <div v-if="price" class="tbuy-price">
      <p class="tbuy-cap">Стандартная цена</p>
      <b>{{ price }}</b>
    </div>

    <div v-if="tour.price_reduced" class="tbuy-row">
      <p class="tbuy-cap">Дети и пенсионеры:</p>
      <p class="tbuy-val">{{ formatPrice(tour.price_reduced) }}</p>
    </div>

    <div v-if="cityLine" class="tbuy-row">
      <p class="tbuy-cap">Места сбора группы:</p>
      <p class="tbuy-val">{{ cityLine }}</p>
    </div>

    <p v-if="settings.tour_individual_note" class="tbuy-note">
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M9 11a3.2 3.2 0 100-6.4A3.2 3.2 0 009 11zm7.4-.4a2.6 2.6 0 100-5.2 2.6 2.6 0 000 5.2zM3 19.4c0-2.7 2.7-4.6 6-4.6s6 1.9 6 4.6M16 14.2c2.9.2 5 1.9 5 4.4"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span>{{ settings.tour_individual_note }}</span>
    </p>

    <p v-if="settings.tour_cancel_note" class="tbuy-note">
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r="8.6"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
        />
        <path
          d="M12 7.4V12l3.2 2"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span>{{ settings.tour_cancel_note }}</span>
    </p>

    <button type="button" class="btn btn-primary tbuy-go" @click="emit('book')">
      Забронировать
    </button>

    <button type="button" class="tbuy-fav">
      <FavoriteButton :id="tour.id" :title="tour.title" />
      <span>В избранное</span>
    </button>

    <p v-if="settings.tour_prepay_note" class="tbuy-prepay">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="var(--lime)" />
        <path
          d="M7.4 12.4l3.1 3.1L16.8 9"
          fill="none"
          stroke="var(--on-bright)"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      {{ settings.tour_prepay_note }}
    </p>
  </aside>
</template>
