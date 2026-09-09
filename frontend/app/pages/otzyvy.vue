<script setup lang="ts">
  /*
   * Страница отзывов. Кадр с заголовком и одна колонка карточек — читают их
   * подряд, сверху вниз, и раскладывать в две колонки значит заставить глаз
   * прыгать между историями.
   *
   * Сверху — средняя оценка и сколько всего отзывов: это первое, ради чего
   * сюда заходят, и считается по тем же карточкам, что ниже, а не пишется
   * руками в админке.
   *
   * Фильтр по туру нужен тем, кто уже выбрал программу и хочет прочитать
   * именно про неё. Пока отзывов немного, он же служит оглавлением.
   *
   * Класс is-catalog у корня снимает верхний отступ страницы: шапка висит
   * над кадром, и без этого между ней и фотографией оставалась белая полоса,
   * сквозь которую просвечивал светлый логотип.
   */
  definePageMeta({ layout: 'catalog' })

  const { data } = await useReviews()
  const { data: site } = await useLanding()
  const route = useRoute()
  const router = useRouter()

  const idOf = (v: unknown): string =>
    typeof v === 'string' ? v : ((v as { id?: string })?.id ?? '')

  /* Свежие сверху: отзыв полугодовой давности внизу никому не мешает,
     а прошлогодний первым — выглядит заброшенной страницей. */
  const sorted = computed(() =>
    [...data.value.items].sort((a, b) => {
      const t = (r: typeof a) => (r.date ? Date.parse(r.date) : 0)
      return t(b) - t(a)
    }),
  )

  /* Выбранный тур живёт в адресе: подборку отзывов о программе можно
     отправить ссылкой, и «назад» возвращает полный список. */
  const picked = computed(() => {
    const v = route.query.tur
    return typeof v === 'string' && v ? v : null
  })

  const tours = computed(() => {
    const seen = new Map<string, string>()
    for (const r of data.value.items) {
      const t = r.tour
      if (t && typeof t === 'object' && t.slug) seen.set(t.slug, t.title)
    }
    return [...seen].map(([slug, title]) => ({ slug, title }))
  })

  const shown = computed(() =>
    picked.value
      ? sorted.value.filter(
          (r) =>
            r.tour &&
            typeof r.tour === 'object' &&
            r.tour.slug === picked.value,
        )
      : sorted.value,
  )

  function pick(slug: string | null) {
    router.push({ path: '/otzyvy', query: slug ? { tur: slug } : {} })
  }

  const photosOf = (reviewId: string) =>
    data.value.photos.filter((p) => idOf(p.review) === reviewId)

  /* Город может прийти объектом (из Directus) или одним id (из моков) —
     разворачиваем по списку городов выезда. */
  const cityOf = (review: (typeof sorted.value)[number]) => {
    const c = review.city
    if (c && typeof c === 'object') return c.name
    if (!c) return null
    return site.value.departureCities.find((x) => x.id === c)?.name ?? null
  }

  const average = computed(() => {
    const marks = data.value.items
      .map((r) => r.rating ?? 0)
      .filter((n) => n > 0)
    if (!marks.length) return null
    const avg = marks.reduce((a, b) => a + b, 0) / marks.length
    return avg.toFixed(1).replace('.', ',')
  })

  const total = computed(() => data.value.items.length)

  useSeoMeta({
    title: 'Отзывы туристов — БогемаТур',
    description:
      'Что пишут о поездках с БогемаТур: отзывы об автобусных турах и экскурсиях по югу России и Кавказу.',
  })
</script>

<template>
  <div class="page is-catalog otzyvy-page">
    <section class="chero ohero">
      <MediaSlot
        class="chero-photo"
        :image="site.landing.seo_image ?? '/demo/hero-kbr.webp'"
        alt=""
        loading="eager"
        :transform="{ width: 1920, quality: 70 }"
      />
      <div class="chero-in wrap">
        <h1 class="chero-h1">Отзывы туристов</h1>
        <p v-if="site.landing.reviews_subtitle" class="ohero-sub">
          {{ site.landing.reviews_subtitle }}
        </p>
        <div v-if="average" class="ohero-score">
          <b>{{ average }}</b>
          <span class="ohero-stars" aria-hidden="true">
            <svg
              v-for="n in 5"
              :key="n"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 2l3 6.6 7 .7-5.2 4.8 1.4 7-6.2-3.6L5.8 21l1.4-7L2 9.3l7-.7z"
              />
            </svg>
          </span>
          <span class="ohero-count"
            >{{ total }} {{ plural(total, 'отзыв', 'отзыва', 'отзывов') }}</span
          >
        </div>
      </div>
    </section>

    <div class="wrap">
      <nav class="crumbs">
        <NuxtLink to="/">Главная</NuxtLink>
        <span>Отзывы</span>
      </nav>

      <div v-if="tours.length > 1" class="ofilter">
        <button
          type="button"
          class="ochip"
          :class="{ on: !picked }"
          @click="pick(null)"
        >
          Все отзывы
        </button>
        <button
          v-for="t in tours"
          :key="t.slug"
          type="button"
          class="ochip"
          :class="{ on: picked === t.slug }"
          @click="pick(t.slug)"
        >
          {{ t.title }}
        </button>
      </div>

      <div v-if="shown.length" class="olist">
        <ReviewFull
          v-for="r in shown"
          :key="r.id"
          :review="r"
          :photos="photosOf(r.id)"
          :city="cityOf(r)"
        />
      </div>
      <p v-else class="olist-empty">
        Об этом туре ещё не написали. Посмотрите отзывы обо всех поездках или
        оставьте заявку — расскажем о программе сами.
      </p>
    </div>
  </div>
</template>
