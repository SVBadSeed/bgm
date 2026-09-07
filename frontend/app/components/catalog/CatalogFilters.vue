<script setup lang="ts">
  /*
   * Фильтры каталога — колонкой слева, по образцу yarko.travel: сверху кнопка
   * сброса со счётчиком, ниже сворачиваемые группы. Города, направления и
   * месяцы — списки значений; длительность и цена — отрезки, которые задают
   * галочками или своими числами.
   *
   * Сброс двухуровневый: общий сверху и свой у каждой группы. Списка
   * выбранного отдельной строкой нет — он занимал место наверху колонки и
   * повторял то, что и так видно в самих группах.
   *
   * Тип тура и быстрые срезы длительности стоят в шапке страницы — держать их
   * ещё и здесь значит показывать один переключатель дважды в одном экране.
   *
   * Значения живут в адресе страницы, а не внутри компонента: подборку
   * «Дагестан из Армавира в октябре» можно отправить ссылкой, а кнопка «назад»
   * возвращает предыдущий набор.
   *
   * На телефоне колонка схлопывается в одну кнопку и открывается шторкой снизу:
   * развёрнутые фильтры занимали там пол-экрана, и до карточек приходилось
   * доскроллить — ровно та жалоба, что была на старом сайте.
   */
  import type { Departure, DepartureCity, Destination } from '~/types/schema'
  import type { CatalogQuery, LengthKey } from '~/utils/catalogFilter'
  import type { FacetKey } from '~/utils/facets'

  const props = defineProps<{
    destinations: Destination[]
    cities: DepartureCity[]
    departures: Departure[]
    /** Даты выездов для календаря «Когда» */
    days: string[]
    query: CatalogQuery
    /* Город и направление могут быть заданы самой страницей — тогда их не
       выбирают: за них отвечает адрес. */
    lockCity?: boolean
    lockDestination?: boolean
    /** Границы ползунков считаются по турам раздела, а не по всему каталогу */
    priceBounds: [number, number]
    maxDays: number
    /** Признаки-справочники, у которых в разделе есть из чего выбирать */
    facetGroups: {
      key: FacetKey
      title: string
      options: { value: string; label: string }[]
    }[]
    total: number
  }>()

  const emit = defineEmits<{ change: [CatalogQuery] }>()

  const LENGTHS: { value: LengthKey; label: string }[] = [
    { value: '1', label: 'Однодневный (1 день)' },
    { value: '2', label: 'На 2 дня' },
    { value: '3', label: 'На 3 дня' },
    { value: 'ot4', label: 'Многодневный (от 4 дней)' },
  ]

  const months = computed(() => monthsWithDepartures(props.departures))

  const cityOptions = computed(() =>
    props.cities
      .filter((c) => c.slug)
      .map((c) => ({ value: c.slug as string, label: c.name })),
  )
  const destOptions = computed(() =>
    props.destinations
      .filter((d) => d.slug)
      .map((d) => ({ value: d.slug as string, label: d.name })),
  )

  function patch(part: Partial<CatalogQuery>) {
    emit('change', { ...props.query, ...part })
  }

  /* Повторный клик снимает значение: иначе от него не избавиться, не трогая
     «Сбросить», а это лишний шаг ради одной галочки. */
  function toggleIn<T extends string>(now: T[], value: T): T[] {
    return now.includes(value) ? now.filter((v) => v !== value) : [...now, value]
  }

  const facetOn = (key: FacetKey, value: string) =>
    (props.query.facets?.[key] ?? []).includes(value)

  function toggleFacet(key: FacetKey, value: string) {
    const now = props.query.facets?.[key] ?? []
    patch({
      facets: { ...props.query.facets, [key]: toggleIn(now, value) },
    })
  }

  const num = (e: Event) => {
    const v = Number((e.target as HTMLInputElement).value)
    return Number.isFinite(v) && v > 0 ? v : null
  }

  /*
   * Сколько значений выбрано в каждой группе: от этого зависит и её
   * собственная кнопка сброса, и общий счётчик наверху.
   */
  const counts = computed(() => {
    const q = props.query
    return {
      city: props.lockCity ? 0 : (q.city?.length ?? 0),
      destination: props.lockDestination ? 0 : (q.destination?.length ?? 0),
      days: (q.length?.length ?? 0) + (q.daysFrom ? 1 : 0) + (q.daysTo ? 1 : 0),
      /* Отрезок дат считаем одним выбором, а не двумя: человек выбрал одну
         дату, а «с» и «по» — то, как мы её записали. */
      month: (q.month?.length ?? 0) + (q.from || q.to ? 1 : 0),
      price: (q.priceMin ? 1 : 0) + (q.priceMax ? 1 : 0),
      type: q.type ? 1 : 0,
    }
  })

  const facetCount = (key: FacetKey) => props.query.facets?.[key]?.length ?? 0

  const activeCount = computed(
    () =>
      Object.values(counts.value).reduce((n, v) => n + v, 0) +
      props.facetGroups.reduce((n, g) => n + facetCount(g.key), 0),
  )

  function clearFacet(key: FacetKey) {
    patch({ facets: { ...props.query.facets, [key]: [] } })
  }

  /* Сброс не трогает то, за что отвечает адрес страницы */
  function reset() {
    emit('change', {
      sort: props.query.sort,
      q: props.query.q,
      from: null,
      to: null,
      city: props.lockCity ? props.query.city : [],
      destination: props.lockDestination ? props.query.destination : [],
      facets: null,
    })
  }

  /* Шторка только на узком экране; на широком колонка открыта всегда */
  const open = ref(false)
  watch(open, (v) => {
    if (import.meta.client) document.body.style.overflow = v ? 'hidden' : ''
  })
  onBeforeUnmount(() => {
    if (import.meta.client) document.body.style.overflow = ''
  })

  defineExpose({ openSheet: () => (open.value = true), activeCount })
</script>

<template>
  <div class="cfilters" :class="{ open }">
    <div class="cfilters-head">
      <span>Фильтры</span>
      <button type="button" aria-label="Закрыть" @click="open = false">✕</button>
    </div>

    <div class="cfilters-body">
      <!-- Общий сброс висит сверху всегда: пока ничего не выбрано, он просто
           показывает, что сбрасывать нечего, и колонка не прыгает от его
           появления. -->
      <button
        type="button"
        class="fclear"
        :class="{ on: activeCount }"
        :disabled="!activeCount"
        @click="reset"
      >
        Сбросить фильтры<template v-if="activeCount"> ({{ activeCount }})</template>
      </button>

      <FilterGroup
        v-if="!lockCity"
        title="Город выезда"
        :active="counts.city > 0"
        @clear="patch({ city: [] })"
      >
        <SelectMenu
          :model-value="query.city ?? []"
          :options="cityOptions"
          all-label="Все города"
          multiple
          @update:model-value="patch({ city: $event as string[] })"
        />
      </FilterGroup>

      <FilterGroup
        v-if="!lockDestination"
        title="Направление"
        :active="counts.destination > 0"
        @clear="patch({ destination: [] })"
      >
        <SelectMenu
          :model-value="query.destination ?? []"
          :options="destOptions"
          all-label="Все направления"
          multiple
          @update:model-value="patch({ destination: $event as string[] })"
        />
      </FilterGroup>

      <FilterGroup
        title="Количество дней"
        :active="counts.days > 0"
        @clear="patch({ length: [], daysFrom: null, daysTo: null })"
      >
        <label v-for="l in LENGTHS" :key="l.value" class="fcheck">
          <input
            type="checkbox"
            :checked="(query.length ?? []).includes(l.value)"
            @change="patch({ length: toggleIn(query.length ?? [], l.value) })"
          />
          <i class="selm-box" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24">
              <path
                d="M5 12.5l4.5 4.5L19 7"
                fill="none"
                stroke="currentColor"
                stroke-width="3.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </i>
          <span>{{ l.label }}</span>
        </label>

        <p class="fhint">Или задайте количество дней</p>
        <div class="fpair">
          <input
            class="ffield"
            type="number"
            min="1"
            :max="maxDays"
            placeholder="От"
            :value="query.daysFrom ?? ''"
            @change="patch({ daysFrom: num($event) })"
          />
          <span class="fdash">–</span>
          <input
            class="ffield"
            type="number"
            min="1"
            :max="maxDays"
            placeholder="До"
            :value="query.daysTo ?? ''"
            @change="patch({ daysTo: num($event) })"
          />
        </div>
        <RangeSlider
          :min="1"
          :max="maxDays"
          :step="1"
          :from="query.daysFrom ?? null"
          :to="query.daysTo ?? null"
          @change="(from, to) => patch({ daysFrom: from, daysTo: to })"
        />
      </FilterGroup>

      <!-- Дата и месяц одной группой: это один вопрос «когда», и держать
           календарь отдельно от списка месяцев значит спрашивать дважды. -->
      <FilterGroup
        v-if="months.length"
        title="Когда"
        :active="counts.month > 0"
        @clear="patch({ month: [], from: null, to: null })"
      >
        <WhenPicker
          inline
          :months="months"
          :days="days"
          :month="query.month ?? []"
          :from="query.from ?? null"
          :to="query.to ?? null"
          @change="patch($event)"
        />
      </FilterGroup>

      <FilterGroup
        title="Цена"
        :active="counts.price > 0"
        @clear="patch({ priceMin: null, priceMax: null })"
      >
        <div class="fpair">
          <label class="ffield is-money">
            <input
              type="number"
              min="0"
              step="500"
              :placeholder="String(priceBounds[0])"
              :value="query.priceMin ?? ''"
              @change="patch({ priceMin: num($event) })"
            />
            <span>₽</span>
          </label>
          <span class="fdash">–</span>
          <label class="ffield is-money">
            <input
              type="number"
              min="0"
              step="500"
              :placeholder="String(priceBounds[1])"
              :value="query.priceMax ?? ''"
              @change="patch({ priceMax: num($event) })"
            />
            <span>₽</span>
          </label>
        </div>
        <RangeSlider
          :min="priceBounds[0]"
          :max="priceBounds[1]"
          :step="500"
          :from="query.priceMin ?? null"
          :to="query.priceMax ?? null"
          @change="(from, to) => patch({ priceMin: from, priceMax: to })"
        />
      </FilterGroup>

      <FilterGroup
        v-for="g in facetGroups"
        :key="g.key"
        :title="g.title"
        :open="false"
        :active="facetCount(g.key) > 0"
        @clear="clearFacet(g.key)"
      >
        <label v-for="o in g.options" :key="o.value" class="fcheck">
          <input
            type="checkbox"
            :checked="facetOn(g.key, o.value)"
            @change="toggleFacet(g.key, o.value)"
          />
          <i class="selm-box" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24">
              <path
                d="M5 12.5l4.5 4.5L19 7"
                fill="none"
                stroke="currentColor"
                stroke-width="3.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </i>
          <span>{{ o.label }}</span>
        </label>
      </FilterGroup>
    </div>

    <div class="cfilters-foot">
      <button type="button" class="btn cfilters-apply" @click="open = false">
        Показать {{ total }}
      </button>
    </div>
  </div>

  <div v-if="open" class="cfilters-veil" @click="open = false"></div>
</template>
