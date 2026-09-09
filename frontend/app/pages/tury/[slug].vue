<script setup lang="ts">
  /*
   * Страница тура. Раскладка повторяет старый сайт: мозаика фотографий,
   * панель разделов, слева содержание маршрута, справа едущая с прокруткой
   * карточка цены. Порядок блоков тот же — он привычен и менеджерам, и
   * постоянным клиентам, а искать расписание в новом месте им незачем.
   *
   * Бронирования на сайте нет: «Забронировать» подставляет тур и дату в форму
   * заявки внизу и подводит к ней. Обещать мгновенную бронь, когда места
   * держит менеджер, было бы обманом.
   */
  import type { Departure } from '~/types/schema'

  definePageMeta({ layout: 'page' })

  const route = useRoute()
  const slug = computed(() => String(route.params.slug))

  const { data } = await useCatalog()

  const tour = computed(() =>
    data.value.tours.find((t) => t.slug === slug.value),
  )

  if (!tour.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Тур не найден',
      fatal: true,
    })
  }

  const { data: content } = await useTourContent(tour.value.id)
  const { data: site } = await useLanding()
  const assetUrl = useAssetUrl()

  const idOf = (v: unknown): string =>
    typeof v === 'string' ? v : ((v as { id?: string })?.id ?? '')

  const destSlug = computed(
    () => (tour.value?.destination as { slug?: string } | null)?.slug ?? null,
  )
  const destination = computed(
    () => data.value.destinations.find((d) => d.slug === destSlug.value) ?? null,
  )

  /* Выезды этого тура — только будущие и по возрастанию даты */
  const departures = computed(() =>
    tour.value ? departuresOf(data.value.departures, tour.value) : [],
  )

  /* Города сбора — те, из которых этот тур действительно уходит */
  const pickups = computed(() => {
    const ids = new Set(
      departures.value.map((d) => idOf(d.city)).filter(Boolean),
    )
    return data.value.cities.filter((c) => ids.has(c.id))
  })

  /* Галерея: кадр тура первым, дальше — из коллекции фотографий */
  const photos = computed(() => {
    const list = [tour.value?.image, ...content.value.photos.map((p) => p.image)]
    const seen = new Set<string>()
    return list.filter((img) => {
      if (!img) return false
      const key = typeof img === 'string' ? img : idOf(img)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  })

  const lines = (text: string | null | undefined) =>
    (text ?? '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

  const included = computed(() => lines(tour.value?.included))
  const extras = computed(() => lines(tour.value?.extra_costs))

  const labelOf = (key: 'difficulty' | 'transport') => {
    const facet = FACETS.find((f) => f.key === key)
    const value = tour.value?.[key]
    return facet && value ? facetLabel(facet, value) : null
  }

  /* Сложность точками: словами «средний» ничего не говорит, пока не с чем
     сравнить, а четыре точки сразу показывают шкалу. */
  const level = computed(() => {
    const map: Record<string, number> = {
      legkiy: 1,
      sredniy: 2,
      slozhnyy: 3,
    }
    return map[tour.value?.difficulty ?? ''] ?? 0
  })

  /* Теги под описанием: направление, формат, транспорт, бейдж */
  const tags = computed(() =>
    [
      destination.value?.name,
      tour.value?.kind === 'tour' ? 'Многодневные туры' : 'Экскурсии',
      labelOf('transport') ? `${labelOf('transport')}ные туры` : null,
      tour.value?.tag,
    ].filter(Boolean) as string[],
  )

  /* Разделы, которые на этой странице есть: из них собирается панель */
  const nav = computed(() =>
    [
      content.value.days.length ? { id: 'program', label: 'Программа тура' } : null,
      tour.value?.hotel_name ? { id: 'hotel', label: 'Проживание' } : null,
      included.value.length
        ? { id: 'included', label: 'Включено в стоимость' }
        : null,
      extras.value.length ? { id: 'extras', label: 'Доп. расходы' } : null,
      pickups.value.length
        ? { id: 'pickup', label: 'Места сбора группы' }
        : null,
      { id: 'dates', label: 'Даты и наличие мест' },
    ].filter(Boolean) as { id: string; label: string }[],
  )

  /* Похожие — из того же направления, остальные следом: пустая полка внизу
     страницы читается как обрыв. */
  const similar = computed(() => {
    const others = data.value.tours.filter((t) => t.slug !== slug.value)
    const same = others.filter(
      (t) =>
        (t.destination as { slug?: string } | null)?.slug === destSlug.value,
    )
    return [...same, ...others.filter((t) => !same.includes(t))].slice(0, 8)
  })

  const hotelOpen = ref(false)

  /*
   * Заявка. Тур и дату кладём в общее состояние — форма внизу страницы их
   * подхватит и подставит в сообщение, чтобы менеджер сразу видел, о чём речь.
   */
  const preset = useState<string>('lead-preset', () => '')

  function book(d?: Departure) {
    const parts = [`Тур: ${tour.value?.title}`]
    if (d) {
      parts.push(`выезд ${formatRange(d.date_start, d.date_end)}`)
      const city = data.value.cities.find((c) => c.id === idOf(d.city))
      if (city) parts.push(`из ${city.case_genitive || genitive(city.name)}`)
    }
    preset.value = `${parts.join(', ')}.`
    document.getElementById('lead')?.scrollIntoView({ behavior: 'smooth' })
  }

  useSeoMeta({
    title: () => `${tour.value?.title ?? 'Тур'} — БогемаТур`,
    description: () =>
      tour.value?.intro ??
      `${tour.value?.title}: расписание выездов, цены и программа по дням.`,
    ogTitle: () => tour.value?.title ?? '',
    ogDescription: () => tour.value?.intro ?? '',
    ogImage: () =>
      assetUrl(tour.value?.image, { width: 1200, height: 630 }) ?? undefined,
    ogType: 'website',
  })
</script>

<template>
  <div v-if="tour" class="page tour-page">
    <div class="wrap">
      <nav class="crumbs">
        <NuxtLink to="/">Главная</NuxtLink>
        <NuxtLink to="/tury">Туры и экскурсии</NuxtLink>
        <span>{{ tour.title }}</span>
      </nav>

      <TourGallery :photos="photos" :alt="tour.title" :badge="tour.tag" />
    </div>

    <!-- Панель разделов идёт полосой во всю ширину, поэтому живёт снаружи
         контейнера, а не внутри него. -->
    <TourNav :items="nav" />

    <div class="wrap">
      <div class="tour-grid">
        <div class="tour-main">
          <h1 class="page-h1">{{ tour.title }}</h1>

          <div class="tcards">
            <div v-if="labelOf('difficulty')" class="tcard">
              <p class="tcard-cap">Сложность маршрута:</p>
              <p class="tcard-val">
                {{ labelOf('difficulty') }}
                <span class="tdots" aria-hidden="true">
                  <i v-for="n in 4" :key="n" :class="{ on: n <= level }"></i>
                </span>
              </p>
            </div>
            <div v-if="tour.age_label" class="tcard">
              <p class="tcard-cap">Допустимый возраст:</p>
              <p class="tcard-val">{{ tour.age_label }}</p>
            </div>
            <div v-if="tour.duration_label" class="tcard">
              <p class="tcard-cap">Продолжительность:</p>
              <p class="tcard-val">{{ tour.duration_label }}</p>
            </div>
          </div>

          <section v-if="tour.intro" class="tsec">
            <h2 class="tsec-h">Описание</h2>
            <p class="tintro">{{ tour.intro }}</p>
            <div v-if="tags.length" class="ttags">
              <span v-for="t in tags" :key="t" class="ttag">{{ t }}</span>
            </div>
          </section>

          <section v-if="content.days.length" id="program" class="tsec">
            <h2 class="tsec-h">Программа тура</h2>
            <TourProgram
              :days="content.days"
              :booklet-url="tour.booklet_url"
            />
          </section>

          <section v-if="tour.hotel_name" id="hotel" class="tsec">
            <h2 class="tsec-h">Проживание</h2>
            <div class="tday thotel" :class="{ open: hotelOpen }">
              <button
                type="button"
                class="tday-head"
                @click="hotelOpen = !hotelOpen"
              >
                <span class="tday-title">{{ tour.hotel_name }}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <div class="tday-body">
                <div class="tday-in">
                  <div class="thotel-in">
                    <MediaSlot
                      v-if="tour.hotel_image"
                      class="thotel-photo"
                      :image="tour.hotel_image"
                      :alt="tour.hotel_name"
                      :transform="{ width: 640, height: 460 }"
                    />
                    <p v-if="tour.hotel_text">{{ tour.hotel_text }}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section v-if="included.length" id="included" class="tsec">
            <h2 class="tsec-h">Включено в стоимость тура</h2>
            <ul class="tlist is-in">
              <li v-for="i in included" :key="i">{{ i }}</li>
            </ul>
          </section>

          <section v-if="extras.length" id="extras" class="tsec">
            <h2 class="tsec-h">Дополнительные расходы</h2>
            <ul class="tlist is-extra">
              <li v-for="e in extras" :key="e">{{ e }}</li>
            </ul>
          </section>

          <section v-if="pickups.length" id="pickup" class="tsec">
            <h2 class="tsec-h">Места сбора группы</h2>
            <div class="tpick">
              <div v-for="c in pickups" :key="c.id" class="tpick-city">
                <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="10"
                    r="2.4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                  />
                </svg>
                <div>
                  <b>{{ c.name }}</b>
                  <span v-if="c.pickup_note">{{ c.pickup_note }}</span>
                </div>
              </div>
            </div>
          </section>

          <section v-if="tour.extra_note" class="tsec">
            <div class="tmore">
              <h2 class="tsec-h">Дополнительно</h2>
              <p>{{ tour.extra_note }}</p>
            </div>
          </section>

          <section id="dates" class="tsec">
            <h2 class="tsec-h">Даты и наличие мест</h2>
            <TourDates
              :tour="tour"
              :departures="departures"
              :cities="data.cities"
              @book="book"
            />
          </section>
        </div>

        <TourAside
          :tour="tour"
          :settings="site.settings"
          :cities="pickups"
          @book="book()"
        />
      </div>
    </div>

    <ToursRail
      id="similar"
      title="Похожие туры"
      all-url="/tury"
      :items="similar"
      :departures="data.departures"
    />
  </div>
</template>
