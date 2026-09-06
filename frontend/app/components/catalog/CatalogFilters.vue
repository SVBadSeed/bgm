<script setup lang="ts">
  /*
   * Фильтры каталога — колонкой слева, по образцу yarko.travel: сверху то, что
   * уже выбрано, ниже сворачиваемые группы. Города, направления и месяцы —
   * списки значений; длительность и цена — отрезки, которые задают галочками
   * или своими числами.
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

  function rangeLabel(
    from: number | null | undefined,
    to: number | null | undefined,
    unit: string,
  ): string {
    const n = (v: number) => v.toLocaleString('ru-RU')
    if (from && to) return `${n(from)}–${n(to)} ${unit}`
    if (from) return `от ${n(from)} ${unit}`
    return `до ${n(to as number)} ${unit}`
  }

  /*
   * Выбранное — строкой сверху. Иначе, чтобы понять, почему в выдаче три тура,
   * приходится проглядеть всю колонку, а на телефоне ещё и открыть шторку.
   */
  interface Chip {
    key: string
    label: string
    clear: () => void
  }

  const chips = computed<Chip[]>(() => {
    const out: Chip[] = []
    const q = props.query

    if (q.type) {
      out.push({
        key: 'type',
        label: q.type === 'hot' ? 'Горящие' : 'Новые',
        clear: () => patch({ type: null }),
      })
    }
    if (!props.lockCity) {
      for (const slug of q.city ?? []) {
        const label = cityOptions.value.find((c) => c.value === slug)?.label
        out.push({
          key: `city-${slug}`,
          label: `Из города: ${label ?? slug}`,
          clear: () => patch({ city: (q.city ?? []).filter((v) => v !== slug) }),
        })
      }
    }
    if (!props.lockDestination) {
      for (const slug of q.destination ?? []) {
        const label = destOptions.value.find((d) => d.value === slug)?.label
        out.push({
          key: `dest-${slug}`,
          label: label ?? slug,
          clear: () =>
            patch({
              destination: (q.destination ?? []).filter((v) => v !== slug),
            }),
        })
      }
    }
    for (const value of q.length ?? []) {
      const label = LENGTHS.find((l) => l.value === value)?.label
      out.push({
        key: `len-${value}`,
        label: label ?? value,
        clear: () =>
          patch({ length: (q.length ?? []).filter((v) => v !== value) }),
      })
    }
    if (q.daysFrom || q.daysTo) {
      out.push({
        key: 'days',
        label: rangeLabel(q.daysFrom, q.daysTo, 'дн.'),
        clear: () => patch({ daysFrom: null, daysTo: null }),
      })
    }
    for (const value of q.month ?? []) {
      const label = months.value.find((m) => m.value === value)?.label
      out.push({
        key: `month-${value}`,
        label: label ?? value,
        clear: () =>
          patch({ month: (q.month ?? []).filter((v) => v !== value) }),
      })
    }
    if (q.priceMin || q.priceMax) {
      out.push({
        key: 'price',
        label: rangeLabel(q.priceMin, q.priceMax, '₽'),
        clear: () => patch({ priceMin: null, priceMax: null }),
      })
    }
    for (const g of props.facetGroups) {
      for (const value of q.facets?.[g.key] ?? []) {
        const label = g.options.find((o) => o.value === value)?.label
        out.push({
          key: `${g.key}-${value}`,
          label: label ?? value,
          clear: () => toggleFacet(g.key, value),
        })
      }
    }
    return out
  })

  const activeCount = computed(() => chips.value.length)

  /* Сброс не трогает то, за что отвечает адрес страницы */
  function reset() {
    emit('change', {
      sort: props.query.sort,
      q: props.query.q,
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
      <div v-if="chips.length" class="fchips">
        <button
          v-for="c in chips"
          :key="c.key"
          type="button"
          class="fchip"
          @click="c.clear()"
        >
          {{ c.label }}
          <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              stroke-width="2.6"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <FilterGroup v-if="!lockCity" title="Город выезда">
        <SelectMenu
          :model-value="query.city ?? []"
          :options="cityOptions"
          all-label="Все города"
          multiple
          @update:model-value="patch({ city: $event as string[] })"
        />
      </FilterGroup>

      <FilterGroup v-if="!lockDestination" title="Направление">
        <SelectMenu
          :model-value="query.destination ?? []"
          :options="destOptions"
          all-label="Все направления"
          multiple
          @update:model-value="patch({ destination: $event as string[] })"
        />
      </FilterGroup>

      <FilterGroup title="Количество дней">
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

      <FilterGroup v-if="months.length" title="Месяц выезда">
        <div class="cfilters-chips">
          <button
            v-for="m in months"
            :key="m.value"
            type="button"
            class="cchip"
            :class="{ on: (query.month ?? []).includes(m.value) }"
            @click="patch({ month: toggleIn(query.month ?? [], m.value) })"
          >
            {{ m.label }}
          </button>
        </div>
      </FilterGroup>

      <FilterGroup title="Цена">
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

      <button
        v-if="activeCount"
        type="button"
        class="cfilters-reset"
        @click="reset"
      >
        Сбросить все фильтры
      </button>
    </div>

    <div class="cfilters-foot">
      <button type="button" class="btn cfilters-apply" @click="open = false">
        Показать {{ total }}
      </button>
    </div>
  </div>

  <div v-if="open" class="cfilters-veil" @click="open = false"></div>
</template>
