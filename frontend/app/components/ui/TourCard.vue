<script setup lang="ts">
  import type { Departure, Tour } from '~/types/schema'

  const props = withDefaults(
    defineProps<{
      tour: Tour
      departures?: Departure[]
      /* Размер скидки показываем только там, где акция и есть предмет
         разговора — в блоке горящих. В обычных лентах это витрина туров,
         а не распродажа. */
      showDiscount?: boolean
    }>(),
    { departures: () => [], showDiscount: false },
  )

  /* Автобусный тур выбирают по тому, когда он идёт. Одна ближайшая дата
     отвечала только на «когда», но не на «а ещё когда» — а спрашивают
     обычно именно это. Две даты подряд сразу показывают, что расписание
     регулярное, а счётчик снимает вопрос, сколько их всего. */
  const SHOWN_DATES = 2
  const dates = computed(() => departuresOf(props.departures, props.tour))
  const nextDates = computed(() =>
    dates.value.slice(0, SHOWN_DATES).map((d) => ({
      key: d.id,
      label: formatRangeShort(d.date_start, d.date_end),
    })),
  )
  const restDates = computed(() =>
    Math.max(0, dates.value.length - SHOWN_DATES),
  )

  // «3 дня / 2 ночи» → две пилюли; «9 часов» → одна. Так длительность
  // считывается с одного взгляда, а не тонет в серой мета-строке.
  const durationParts = computed(() =>
    (props.tour.duration_label ?? '')
      .split('/')
      .map((p) => p.trim())
      .filter(Boolean),
  )

  const discount = computed(() =>
    props.showDiscount ? discountPercent(props.tour) : null,
  )

  const price = computed(() => {
    const p = formatPrice(props.tour.price_from)
    return props.tour.price_prefix ? `${props.tour.price_prefix} ${p}` : p
  })
</script>

<template>
  <NuxtLink class="pcard" :to="tourUrl(tour)">
    <div class="pcard-media">
      <span v-if="tour.tag" class="pcard-tag ticket">{{ tour.tag }}</span>
      <!-- Скидка перебивает обычный бейдж: там, где мы её вообще показываем,
           это главное, что о туре нужно знать с первого взгляда. -->
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
    <!-- Длительность и ближайшая дата — один ряд: это ответ на один вопрос
         «сколько и когда», и раздельными строками карточка рассыпалась. -->
    <div v-if="durationParts.length || nextDates.length" class="pcard-facts">
      <div
        v-if="durationParts.length"
        class="pcard-pills"
        :class="{ 'ticket-pair': durationParts.length === 2 }"
      >
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
      <div v-if="nextDates.length" class="pcard-when">
        <span v-for="d in nextDates" :key="d.key" class="pwhen">{{
          d.label
        }}</span>
        <span v-if="restDates" class="pwhen pwhen-more"
          >+{{ restDates }} {{ plural(restDates, 'дата', 'даты', 'дат') }}</span
        >
      </div>
    </div>
    <div v-if="tour.price_from != null" class="pcard-price">
      <b>{{ price }}</b>
      <small v-if="tour.price_note">{{ tour.price_note }}</small>
    </div>
  </NuxtLink>
</template>
