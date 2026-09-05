<script setup lang="ts">
  import type { Review } from '~/types/schema'

  defineProps<{
    id: string
    title: string | null
    badge: string | null
    subtitle: string | null
    allUrl: string | null
    items: Review[]
  }>()
</script>

<template>
  <!-- band: заливка во всю ширину со скруглением того же радиуса, что у
       основного полотна страницы. Секция читается как отдельная остановка. -->
  <section v-if="items.length" :id="id" class="sec band">
    <div class="wrap">
      <div class="sec-head is-center">
        <!-- Билет над заголовком: тот же элемент, что у длительности тура,
             поэтому оценка читается как часть системы, а не как наклейка. -->
        <span v-if="badge" class="band-badge ticket">{{ badge }}</span>
        <h2 class="sec-h2">{{ title }}</h2>
        <p v-if="subtitle" class="band-sub">{{ subtitle }}</p>
      </div>
      <!-- .revs прокручивается вбок, поэтому ревил на ленте, не на карточках -->
      <div v-reveal="'stagger'" class="revs">
        <ReviewCard
          v-for="(r, i) in items"
          :key="r.id"
          :style="{ '--rv-i': Math.min(i, 3) }"
          :review="r"
        />
      </div>
      <div v-if="allUrl" class="band-foot">
        <a class="all-link" :href="allUrl">Все отзывы</a>
      </div>
    </div>
  </section>
</template>
