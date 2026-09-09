<script setup lang="ts">
  /*
   * Галерея тура мозаикой: крупный кадр слева и четыре поменьше справа —
   * так же, как на старом сайте. Человек видит сразу пять мест маршрута,
   * а не одно, и не листает карусель, чтобы понять, куда едет.
   *
   * Клик по любому кадру ставит его на место главного: это дешевле лайтбокса
   * и не уводит со страницы.
   *
   * Кадров меньше пяти — мозаика перестраивается сама: сетка справа получает
   * меньше клеток, и дырок в раскладке не остаётся.
   */
  import type { ImageRef } from '~/types/schema'

  const props = defineProps<{
    photos: ImageRef[]
    alt: string
    /** Бейдж на большом кадре: «Новинка», «Лидер продаж» */
    badge?: string | null
  }>()

  const main = ref(0)

  /* Справа — следующие четыре кадра по кругу, минуя главный */
  const rest = computed(() => {
    const out: { image: ImageRef; index: number }[] = []
    for (let i = 1; i <= 4 && i < props.photos.length; i++) {
      const index = (main.value + i) % props.photos.length
      out.push({ image: props.photos[index], index })
    }
    return out
  })

  watch(
    () => props.photos,
    () => (main.value = 0),
  )
</script>

<template>
  <div v-if="photos.length" class="tgal" :class="{ solo: rest.length === 0 }">
    <div class="tgal-main">
      <span v-if="badge" class="tgal-badge ticket">{{ badge }}</span>
      <MediaSlot
        :image="photos[main]"
        :alt="alt"
        loading="eager"
        :transform="{ width: 1200, height: 900 }"
      />
    </div>
    <div v-if="rest.length" class="tgal-rest">
      <button
        v-for="p in rest"
        :key="p.index"
        type="button"
        class="tgal-cell"
        :aria-label="`Показать фото ${p.index + 1}`"
        @click="main = p.index"
      >
        <MediaSlot
          :image="p.image"
          :alt="alt"
          :transform="{ width: 640, height: 480 }"
        />
      </button>
    </div>
  </div>
</template>
