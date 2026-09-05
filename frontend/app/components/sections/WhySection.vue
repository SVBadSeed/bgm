<script setup lang="ts">
  import type { Advantage } from '~/types/schema'

  defineProps<{ id: string; title: string | null; items: Advantage[] }>()
</script>

<template>
  <section v-if="items.length" :id="id" class="sec why-sec">
    <div class="wrap">
      <div class="sec-head">
        <h2 class="sec-h2">{{ title }}</h2>
      </div>
      <!-- Ревил на панели, а не на колонках: каркас и текст в окнах
           должны подъезжать одним куском, иначе окна разъедутся. -->
      <div v-reveal="'bus'" class="why-panel">
        <div v-for="a in items" :key="a.id" class="why">
          <span class="blob"><AdvantageIcon :name="a.icon" /></span>
          <h3>{{ a.title }}</h3>
          <p v-if="a.text">{{ a.text }}</p>
          <a v-if="a.link_label" :href="a.link_url ?? '#'">{{
            a.link_label
          }}</a>
        </div>
        <!-- Каркас последним: колонки раскладываются по окнам через nth-child,
             и лишний ребёнок в начале сбил бы им нумерацию. -->
        <BusFrame />
      </div>
    </div>
  </section>
</template>
