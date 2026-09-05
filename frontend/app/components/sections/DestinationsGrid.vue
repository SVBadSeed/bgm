<script setup lang="ts">
  import type { Destination } from '~/types/schema'

  const props = defineProps<{
    id: string
    title: string | null
    allUrl: string | null
    items: Destination[]
  }>()

  /*
   * Витрина — первые восемь направлений с фотографиями, остальные уходят
   * строкой билетов под ней. Плиток на все направления не напасёшься: их
   * десятки, а на экран влезает восемь, и остальные страницы иначе некуда
   * положить — ни человеку, ни поисковику.
   */
  const SHOWCASE = 8
  const showcase = computed(() => props.items.slice(0, SHOWCASE))
  const rest = computed(() => props.items.slice(SHOWCASE))
</script>

<template>
  <section v-if="items.length" :id="id" class="sec">
    <div class="wrap">
      <div class="sec-head">
        <h2 class="sec-h2">{{ title }}</h2>
        <div class="sec-tools">
          <a v-if="allUrl" class="all-link" :href="allUrl">Все</a>
        </div>
      </div>
      <div class="dgrid">
        <DestinationCard
          v-for="(d, i) in showcase"
          :key="d.id"
          v-reveal="'pop'"
          :style="{ '--rv-i': Math.min(i, 4) }"
          :item="d"
        />
      </div>

      <div v-if="rest.length" class="dest-more">
        <span class="dest-more-cap">Ещё направления</span>
        <div class="dest-tags">
          <a
            v-for="d in rest"
            :key="d.id"
            class="dest-tag ticket"
            :href="d.url ?? '#'"
            >{{ d.name }}</a
          >
          <a v-if="allUrl" class="dest-tag ticket is-all" :href="allUrl"
            >Все направления</a
          >
        </div>
      </div>
    </div>
  </section>
</template>
