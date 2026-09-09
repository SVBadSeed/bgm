<script setup lang="ts">
  /*
   * Отзыв на странице отзывов — в полную величину, без обрезки текста.
   * На главной у карточки другая задача: она стоит в ленте и должна быть
   * одного роста с соседями, поэтому там свой, короткий вид.
   *
   * Порядок строк тот, в котором отзыв читают: кто написал и сколько ездил,
   * оценка, про какой тур речь, сам текст, кадры, внизу — откуда уезжали
   * и когда написано.
   */
  import type { Review, ReviewPhoto } from '~/types/schema'

  const props = defineProps<{
    review: Review
    photos: ReviewPhoto[]
    /* Город приходит готовой строкой: из Directus он может прийти объектом,
       из моков — одним id, и разбирать оба случая внутри карточки незачем. */
    city?: string | null
  }>()

  const stars = computed(() => Math.max(0, Math.min(5, props.review.rating ?? 5)))

  const tour = computed(() =>
    props.review.tour && typeof props.review.tour === 'object'
      ? props.review.tour
      : null,
  )

  const when = computed(() =>
    props.review.date ? formatDate(props.review.date) : null,
  )

  /* Больше четырёх кадров в ряд не показываем: остальные прячем под
     последней плиткой, как это сделано у всех, кто такое умеет. */
  const LIMIT = 4
  const shown = computed(() => props.photos.slice(0, LIMIT))
  const rest = computed(() => Math.max(0, props.photos.length - LIMIT))

  const opened = ref(false)
  const all = computed(() => (opened.value ? props.photos : shown.value))
</script>

<template>
  <article class="rfull">
    <header class="rfull-head">
      <div>
        <b class="rfull-name">{{ review.author }}</b>
        <span v-if="review.traveler" class="rfull-exp">{{
          review.traveler
        }}</span>
      </div>
      <div class="rfull-stars" :aria-label="`Оценка ${stars} из 5`">
        <svg
          v-for="i in stars"
          :key="i"
          width="17"
          height="17"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M12 2l3 6.6 7 .7-5.2 4.8 1.4 7-6.2-3.6L5.8 21l1.4-7L2 9.3l7-.7z"
          />
        </svg>
      </div>
    </header>

    <p v-if="tour" class="rfull-tour">
      Тур:
      <NuxtLink v-if="tour.slug" :to="`/tury/${tour.slug}`">{{
        tour.title
      }}</NuxtLink>
      <span v-else>{{ tour.title }}</span>
    </p>

    <p v-if="review.text" class="rfull-text">{{ review.text }}</p>

    <div v-if="all.length" class="rfull-photos">
      <div v-for="(p, i) in all" :key="p.id" class="rfull-photo">
        <MediaSlot
          :image="p.image"
          :alt="`Фото из отзыва: ${review.author}`"
          :transform="{ width: 420, height: 320 }"
        />
        <!-- Последняя плитка прикрывает остальные кадры: ряд остаётся ровным,
             а «ещё 3 фото» честно говорит, сколько их там. -->
        <button
          v-if="!opened && rest && i === LIMIT - 1"
          type="button"
          class="rfull-more"
          @click="opened = true"
        >
          Ещё {{ rest }} {{ plural(rest, 'фото', 'фото', 'фото') }}
        </button>
      </div>
    </div>

    <footer v-if="city || when" class="rfull-foot">
      <span v-if="city">Город выезда: <b>{{ city }}</b></span>
      <span v-if="when" class="rfull-date">{{ when }}</span>
    </footer>
  </article>
</template>
