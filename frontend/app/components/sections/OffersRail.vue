<script setup lang="ts">
  import type { ForeignOffer } from '~/types/schema'
  import Rail from '~/components/ui/Rail.vue'

  /*
   * Витрина зарубежных предложений. Полка та же, что у горящих туров на
   * главной: тёплый фон, огонёк у заголовка, лучшая скидка рядом. Своя
   * компонента, а не флаг в ToursRail, потому что карточка другая — у отеля
   * нет ни расписания выездов, ни города посадки.
   */
  const props = defineProps<{
    id: string
    title: string | null
    allUrl?: string | null
    items: ForeignOffer[]
  }>()

  const bestDiscount = computed(() =>
    props.items.reduce((max, o) => Math.max(max, offerDiscount(o) ?? 0), 0),
  )

  const rail = ref<InstanceType<typeof Rail> | null>(null)
</script>

<template>
  <section v-if="items.length" :id="id" class="sec hot-sec">
    <div class="wrap">
      <div class="shelf is-hot">
        <div class="wrap">
          <div class="sec-head">
            <h2 class="sec-h2">
              <svg
                class="hot-flame"
                width="28"
                height="31"
                viewBox="0 0 24 26"
                aria-hidden="true"
              >
                <path
                  fill="url(#offerFlame)"
                  d="M13.5 0c.7 4.2-1.2 6.6-3.4 8.8-2.3 2.3-4.9 4.4-4.9 8.4 0 4.5 3.4 8.1 7.6 8.1 4.6 0 8.2-3.4 8.2-8.4 0-3.2-1.4-5.6-2.8-7.6-.4 1.3-1.3 2.3-2.4 2.6.9-4.4-.6-9-2.3-11.9Z"
                />
                <path
                  fill="#ffd166"
                  d="M13 12.6c.5 2.2-.4 3.3-1.4 4.4-.9 1-1.9 2-1.9 3.6 0 1.9 1.5 3.4 3.4 3.4s3.4-1.5 3.4-3.6c0-2.4-2.1-4.4-3.5-7.8Z"
                />
                <defs>
                  <linearGradient id="offerFlame" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#ff9d2e" />
                    <stop offset="1" stop-color="#e4322f" />
                  </linearGradient>
                </defs>
              </svg>
              {{ title }}
              <span v-if="bestDiscount" class="hot-best"
                >до −{{ bestDiscount }}%</span
              >
            </h2>
            <div class="sec-tools">
              <a v-if="allUrl" class="all-link" :href="allUrl">Все</a>
              <RailArrows
                :at-start="rail?.atStart ?? true"
                :at-end="rail?.atEnd ?? false"
                @prev="rail?.go(-1)"
                @next="rail?.go(1)"
              />
            </div>
          </div>
          <Rail ref="rail" v-reveal="'stagger'">
            <OfferCard
              v-for="(o, i) in items"
              :key="o.id"
              :style="{ '--rv-i': Math.min(i, 4) }"
              :offer="o"
            />
          </Rail>
        </div>
      </div>
    </div>
  </section>
</template>
