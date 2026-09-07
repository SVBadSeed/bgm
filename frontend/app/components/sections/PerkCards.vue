<script setup lang="ts">
  /*
   * Три карточки «почему с нами» для внутренних страниц. От блока на главной
   * отличается тем, что здесь нет каркаса автобуса: за границу летят, и
   * автобус в этом месте сбивал бы с толку. Данные — та же коллекция
   * преимуществ, только помеченные другой страницей.
   */
  import type { Advantage } from '~/types/schema'

  defineProps<{ id: string; title: string | null; items: Advantage[] }>()
</script>

<template>
  <section v-if="items.length" :id="id" class="sec perks-sec">
    <div class="wrap">
      <div class="sec-head">
        <h2 class="sec-h2">{{ title }}</h2>
      </div>
      <div v-reveal="'stagger'" class="perks">
        <article
          v-for="(a, i) in items"
          :key="a.id"
          class="perk"
          :style="{ '--rv-i': Math.min(i, 4) }"
        >
          <span class="blob"><AdvantageIcon :name="a.icon" /></span>
          <h3>{{ a.title }}</h3>
          <p v-if="a.text">{{ a.text }}</p>
          <a v-if="a.link_label" :href="a.link_url ?? '#'">{{ a.link_label }}</a>
        </article>
      </div>
    </div>
  </section>
</template>
