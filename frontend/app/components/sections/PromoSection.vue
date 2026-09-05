<script setup lang="ts">
  import type { ImageRef } from '~/types/schema'

  const props = defineProps<{
    title: string | null
    accent: string | null
    buttonLabel: string | null
    buttonUrl: string | null
    image: ImageRef
  }>()

  /* Заголовок полосы умеет те же знаки, что и hero: {paw}, {loop} и прочие */
  const lines = computed(() => splitTitleLines(props.title))
</script>

<template>
  <section v-if="title" class="sec">
    <div class="wrap">
      <!-- Узкая полоса: тёмная плашка с текстом наезжает на кадр волнистым
           краем, кнопка стоит на фото справа. Высокий баннер здесь не нужен —
           это одна строка про акцию, а не отдельная секция. -->
      <div class="promo">
        <div class="promo-media">
          <MediaSlot
            :image="image"
            alt=""
            placeholder="Фото для промо-баннера"
            :transform="{ width: 1600, height: 420 }"
          />
        </div>
        <div class="promo-txt">
          <h2>
            <span v-for="(line, i) in lines" :key="i" class="promo-line">
              <template v-for="(part, j) in line" :key="j">
                <TitleIcon v-if="part.icon" :name="part.icon" />
                <template v-else>{{ part.text }}</template>
              </template>
            </span>
            <em v-if="accent">{{ accent }}</em>
          </h2>
        </div>
        <a
          v-if="buttonLabel"
          class="btn btn-primary promo-cta"
          :href="buttonUrl ?? '#'"
          >{{ buttonLabel }}</a
        >
      </div>
    </div>
  </section>
</template>
