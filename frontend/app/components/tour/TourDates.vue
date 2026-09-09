<script setup lang="ts">
  /*
   * Расписание выездов: сверху переключатель месяцев, ниже строка на каждый
   * выезд — день недели и дата отправления, стрелка, день недели и дата
   * возвращения, цена и кнопка.
   *
   * У однодневных поездок возвращаться нечего: там вместо второй даты стоит
   * длительность. «Пятница → Пятница» выглядело поломкой, хотя формально
   * было правдой.
   *
   * Месяцы собираем из самих выездов: показывать «Декабрь», когда в декабре
   * ничего не идёт, — вести человека в пустоту.
   *
   * Цену берём с выезда, если она там задана: в сезон одна и та же программа
   * стоит дороже, и показывать всем цену «от» значит обещать не то.
   */
  import type { Departure, DepartureCity, Tour } from '~/types/schema'

  const props = defineProps<{
    tour: Tour
    departures: Departure[]
    cities: DepartureCity[]
  }>()

  const emit = defineEmits<{ book: [Departure] }>()

  const idOf = (v: unknown): string =>
    typeof v === 'string' ? v : ((v as { id?: string })?.id ?? '')

  const WEEK = [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
  ]

  const weekday = (iso: string) => WEEK[new Date(iso).getDay()] ?? ''
  const short = (iso: string) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    const p = (n: number) => String(n).padStart(2, '0')
    return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`
  }

  const oneDay = (d: Departure) => !d.date_end || d.date_end === d.date_start

  /* Вкладки: «Ближайшие» и месяцы, в которых есть выезды */
  const months = computed(() => monthsWithDepartures(props.departures))
  const tab = ref<string>('soon')
  watch(
    () => props.tour.id,
    () => (tab.value = 'soon'),
  )

  const shown = computed(() => {
    if (tab.value === 'soon') return props.departures.slice(0, 6)
    return props.departures.filter((d) => d.date_start.slice(0, 7) === tab.value)
  })

  const cityName = (d: Departure) => {
    const c = props.cities.find((x) => x.id === idOf(d.city))
    if (!c) return null
    return c.case_genitive || genitive(c.name)
  }

  const priceOf = (d: Departure) => formatPrice(d.price ?? props.tour.price_from)

  /* «Осталось 3 места» имеет смысл, пока их мало: числом 51 никого не
     торопят, а место в строке оно занимает. */
  const seatsLabel = (d: Departure) => {
    const n = d.seats_left
    if (n == null) return null
    if (n <= 0) return 'Мест нет'
    return `Осталось ${n} ${plural(n, 'место', 'места', 'мест')}`
  }

  const soldOut = (d: Departure) => (d.seats_left ?? 1) <= 0
</script>

<template>
  <div class="tdates">
    <div v-if="months.length > 1" class="tdates-tabs">
      <button
        type="button"
        class="tdtab"
        :class="{ on: tab === 'soon' }"
        @click="tab = 'soon'"
      >
        Ближайшие
      </button>
      <button
        v-for="m in months"
        :key="m.value"
        type="button"
        class="tdtab"
        :class="{ on: tab === m.value }"
        @click="tab = m.value"
      >
        {{ m.label }}
      </button>
    </div>

    <div v-if="shown.length" class="tdates-list">
      <div v-for="d in shown" :key="d.id" class="tdate" :class="{ solo: oneDay(d) }">
        <div class="tdate-row">
          <div class="tdate-side">
            <b>{{ weekday(d.date_start) }}</b>
            <span class="tdate-day">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <rect
                  x="3.4"
                  y="5"
                  width="17.2"
                  height="16"
                  rx="3"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                />
                <path
                  d="M3.4 10h17.2M8 3v4M16 3v4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                />
              </svg>
              {{ short(d.date_start) }}
            </span>
          </div>

          <template v-if="!oneDay(d)">
            <svg
              class="tdate-arrow"
              width="28"
              height="14"
              viewBox="0 0 28 14"
              aria-hidden="true"
            >
              <path
                d="M1 7h25m0 0l-5.5-5.5M26 7l-5.5 5.5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>

            <div class="tdate-side">
              <b>{{ weekday(d.date_end as string) }}</b>
              <span class="tdate-day">
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <rect
                    x="3.4"
                    y="5"
                    width="17.2"
                    height="16"
                    rx="3"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                  />
                  <path
                    d="M3.4 10h17.2M8 3v4M16 3v4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                  />
                </svg>
                {{ short(d.date_end as string) }}
              </span>
            </div>
          </template>

          <!-- Однодневным возвращаться нечего: вместо второй даты — сколько
               времени займёт поездка. -->
          <div v-else-if="tour.duration_label" class="tdate-solo">
            {{ tour.duration_label }}
          </div>

          <div class="tdate-price">{{ priceOf(d) }}</div>

          <button
            type="button"
            class="btn btn-primary"
            :disabled="soldOut(d)"
            @click="emit('book', d)"
          >
            {{ soldOut(d) ? 'Нет мест' : 'Забронировать' }}
          </button>
        </div>

        <div class="tdate-foot">
          <span v-if="d.instant && !soldOut(d)" class="tinstant">
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M13.6 2 4.9 13.1c-.4.5 0 1.3.6 1.3h4.3l-1.4 7.2c-.1.7.8 1.1 1.2.5l8.7-11.1c.4-.5 0-1.3-.6-1.3h-4.3l1.4-7.2c.1-.7-.8-1.1-1.2-.5Z"
              />
            </svg>
            Мгновенная покупка
          </span>
          <span v-if="cityName(d)" class="tdate-from">из {{ cityName(d) }}</span>
          <span
            v-if="seatsLabel(d)"
            class="tseats"
            :class="{ few: (d.seats_left ?? 99) <= 8, none: soldOut(d) }"
            >{{ seatsLabel(d) }}</span
          >
        </div>
      </div>
    </div>

    <p v-else class="tdates-empty">
      В этом месяце выездов нет. Посмотрите соседний или оставьте заявку —
      сообщим, когда появятся даты.
    </p>
  </div>
</template>
