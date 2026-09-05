<script setup lang="ts">
  import type { ImageRef, Tour } from '~/types/schema'
  import Rail from '~/components/ui/Rail.vue'

  /*
   * Лента туров. variant="shelf" оборачивает секцию в цветную плашку с маскотом —
   * так выделяется главный ряд страницы, чтобы полотно из карточек не читалось
   * как одна длинная простыня.
   */
  const props = withDefaults(
    defineProps<{
      id: string
      title: string | null
      allUrl: string | null
      items: Tour[]
      variant?: 'plain' | 'shelf'
      mascot?: ImageRef
    }>(),
    { variant: 'plain', mascot: null },
  )

  const isShelf = computed(() => props.variant === 'shelf')
  const rail = ref<InstanceType<typeof Rail> | null>(null)
</script>

<template>
  <section
    v-if="items.length"
    :id="id"
    class="sec"
    :class="isShelf ? 'shelf-sec' : 'stack'"
  >
    <div class="wrap">
      <div :class="{ shelf: isShelf }">
        <Mascot v-if="isShelf" :image="mascot" />
        <div :class="{ wrap: isShelf }">
          <div class="sec-head">
            <h2 class="sec-h2">{{ title }}</h2>
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
            <TourCard
              v-for="(t, i) in items"
              :key="t.id"
              :style="{ '--rv-i': Math.min(i, 4) }"
              :tour="t"
            />
          </Rail>
        </div>
      </div>
    </div>
  </section>
</template>
