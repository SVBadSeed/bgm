<script setup lang="ts">
  /*
   * Каталог целиком: шапка с поиском, колонка фильтров, выдача.
   *
   * Одна разметка на три страницы — «Все туры», «Туры из города» и «Туры в
   * направление». Разница только в том, какой фильтр задан самой страницей:
   * он не пишется в адрес отдельно, потому что за него уже отвечает путь.
   *
   * Отсюда деление действий. Чипы и колонка слева уточняют запрос и остаются
   * на странице. «Найти» — другое: город и направление определяют раздел, и
   * если их поменяли, переходим на его страницу, где сменится и заголовок, и
   * фото, и «популярное». Всё состояние живёт в адресе: подборку можно
   * отправить ссылкой, а «назад» возвращает предыдущий набор.
   */
  import type { CatalogQuery, SortKey } from '~/utils/catalogFilter'
  import type { ImageRef } from '~/types/schema'
  import CatalogFilters from '~/components/catalog/CatalogFilters.vue'

  const props = defineProps<{
    /** Заголовок, когда ничего не выбрано: «Туры и экскурсии» */
    title: string
    /** Текст последней крошки */
    crumb: string
    image?: ImageRef
    /** slug города или направления, заданного самой страницей */
    lockCity?: string | null
    lockDestination?: string | null
    seoDescription?: string
  }>()

  const idOf = (v: unknown): string =>
    typeof v === 'string' ? v : ((v as { id?: string })?.id ?? '')
  const slugOfDestination = (t: { destination: unknown }) =>
    (t.destination as { slug?: string } | null)?.slug ?? null

  const { data } = await useCatalog()
  const route = useRoute()
  const router = useRouter()

  const SORTS: { value: SortKey; label: string }[] = [
    { value: 'price-asc', label: 'Сначала дешёвые' },
    { value: 'price-desc', label: 'Сначала дорогие' },
  ]

  const cityIdBySlug = computed(
    () =>
      new Map(
        data.value.cities
          .filter((c) => c.slug)
          .map((c) => [c.slug as string, c.id]),
      ),
  )

  const query = computed<CatalogQuery>(() => {
    const q = route.query
    const str = (v: unknown) => (typeof v === 'string' && v ? v : null)
    /* Несколько значений в адресе — через запятую: ?gorod=krasnodar,armavir */
    const arr = (v: unknown) => (str(v) ?? '').split(',').filter(Boolean)
    return {
      q: str(q.poisk),
      month: arr(q.mesyac),
      destination: props.lockDestination
        ? [props.lockDestination]
        : arr(q.napravlenie),
      city: props.lockCity ? [props.lockCity] : arr(q.gorod),
      length: arr(q.dlitelnost) as CatalogQuery['length'],
      daysFrom: Number(str(q.dney_ot)) || null,
      daysTo: Number(str(q.dney_do)) || null,
      type: (str(q.tip) ?? null) as CatalogQuery['type'],
      from: str(q.s),
      to: str(q.po),
      priceMin: Number(str(q.cena_ot)) || null,
      priceMax: Number(str(q.cena_do)) || null,
      facets: Object.fromEntries(
        FACETS.map((f) => [f.key, arr(q[f.param])]),
      ) as CatalogQuery['facets'],
      sort: (str(q.sort) as SortKey) ?? 'date',
    }
  })

  const csv = (v?: string[] | null) => (v?.length ? v.join(',') : undefined)

  /* Адресная часть запроса: то, что не ушло в путь страницы */
  function queryOf(next: CatalogQuery, ownCity = false, ownDest = false) {
    return {
      poisk: next.q || undefined,
      mesyac: csv(next.month),
      napravlenie: ownDest ? undefined : csv(next.destination),
      gorod: ownCity ? undefined : csv(next.city),
      dlitelnost: csv(next.length),
      dney_ot: next.daysFrom || undefined,
      dney_do: next.daysTo || undefined,
      tip: next.type || undefined,
      s: next.from || undefined,
      po: next.to || undefined,
      cena_ot: next.priceMin || undefined,
      cena_do: next.priceMax || undefined,
      ...Object.fromEntries(
        FACETS.map((f) => [f.param, csv(next.facets?.[f.key])]),
      ),
      sort: next.sort && next.sort !== 'date' ? next.sort : undefined,
    }
  }

  /* Уточнение: страница та же, меняется только адресная часть */
  function apply(next: CatalogQuery) {
    router.push({
      path: route.path,
      query: queryOf(next, !!props.lockCity, !!props.lockDestination),
    })
  }

  function refine(part: Partial<CatalogQuery>) {
    apply({ ...query.value, ...part })
  }

  /*
   * «Найти». Раздел выбирает направление, а если его не указали — город.
   * Со страницы уходим только тогда, когда сменили её собственное поле.
   *
   * Своя страница есть ровно у одного значения: «туры в Дагестан и Крым» —
   * это уже общий каталог с двумя галочками, а не раздел.
   */
  function submit(part: Partial<CatalogQuery>) {
    const next = { ...query.value, ...part }
    const dests = next.destination ?? []
    const cities = next.city ?? []
    const only = (v: string[], slug?: string | null) =>
      v.length === 1 && v[0] === slug

    let path = '/tury'
    let ownDest = false
    let ownCity = false

    if (props.lockCity && only(cities, props.lockCity)) {
      path = route.path
      ownCity = true
    } else if (props.lockDestination && only(dests, props.lockDestination)) {
      path = route.path
      ownDest = true
    } else if (dests.length === 1) {
      path = `/napravleniya/${dests[0]}`
      ownDest = true
    } else if (cities.length === 1) {
      path = `/goroda/${cities[0]}`
      ownCity = true
    }

    router.push({ path, query: queryOf(next, ownCity, ownDest) })
  }

  const rows = computed(() =>
    filterCatalog(
      data.value.tours,
      data.value.departures,
      query.value,
      cityIdBySlug.value,
    ),
  )

  /* Всё, что относится к странице, но не к выбранным фильтрам: из этого
     считаются факты в шапке и числа в «популярном» — иначе они прыгали бы
     на каждый чип и перестали быть ориентиром. */
  const base = computed(() =>
    filterCatalog(
      data.value.tours,
      data.value.departures,
      {
        destination: props.lockDestination ? [props.lockDestination] : null,
        city: props.lockCity ? [props.lockCity] : null,
      },
      cityIdBySlug.value,
    ).map((r) => r.tour),
  )

  /*
   * Заголовок собирается из выбранного: «Туры», плюс направление, плюс город.
   * Так со страницы Краснодара клик по «Чечне» в «Популярном» превращает
   * «Туры из Краснодара» в «Туры в Чечню из Краснодара» — человек видит, где
   * он оказался, а поисковик получает осмысленный заголовок на каждый срез.
   *
   * Склоняем правилом, но написание из админки главнее: там лежит поле на
   * случай названия, которое правилам не поддалось.
   */
  const oneOf = (slugs: string[] | null | undefined) =>
    slugs?.length === 1 ? slugs[0] : null

  const destPart = computed(() => {
    const slug = oneOf(query.value.destination)
    if (!slug) return null
    const d = data.value.destinations.find((x) => x.slug === slug)
    if (!d) return null
    return d.case_accusative || accusative(d.name)
  })

  const cityPart = computed(() => {
    const slug = oneOf(query.value.city)
    if (!slug) return null
    const c = data.value.cities.find((x) => x.slug === slug)
    if (!c) return null
    return c.case_genitive || genitive(c.name)
  })

  const heading = computed(() => {
    const parts: string[] = []
    if (destPart.value) parts.push(`в ${destPart.value}`)
    if (cityPart.value) parts.push(`из ${cityPart.value}`)
    return parts.length ? `Туры ${parts.join(' ')}` : props.title
  })

  /*
   * Плашки под заголовком — обещания, а не статистика: «11 программ» человек
   * и так видит в счётчике над выдачей, а выбирает он по тому, кто везёт.
   * Текст берём из админки, чтобы менять его без правки вёрстки.
   */
  const { data: site } = await useLanding()

  const facts = computed(() =>
    (site.value.landing.catalog_facts ?? '')
      .split('|')
      .map((f) => f.trim())
      .filter(Boolean),
  )

  /* Границы ползунков — по турам раздела: в «Турах в Дагестан» шкала цены от
     нуля до полумиллиона бесполезна, там разброс совсем другой. */
  const priceBounds = computed<[number, number]>(() => {
    const prices = base.value.map((t) => t.price_from ?? 0).filter(Boolean)
    if (!prices.length) return [0, 100000]
    const lo = Math.floor(Math.min(...prices) / 500) * 500
    const hi = Math.ceil(Math.max(...prices) / 500) * 500
    return [lo, Math.max(hi, lo + 500)]
  })

  const maxDays = computed(() =>
    Math.max(2, ...base.value.map((t) => daysOf(t))),
  )

  /*
   * Показываем только те признаки, которые в этом разделе вообще встречаются:
   * группа «Тип транспорта» с одним «Автобусом» — лишняя строка, а «Пляжный»
   * на странице Домбая только сбивает.
   */
  const facetGroups = computed(() =>
    FACETS.map((facet) => {
      const seen = new Set<string>()
      for (const t of base.value) {
        const v = facetValue(t, facet)
        if (v) seen.add(v)
      }
      return {
        key: facet.key,
        title: facet.title,
        options: facet.choices.filter((c) => seen.has(c.value)),
      }
    }).filter((g) => g.options.length > 1),
  )

  const cityOptions = computed(() =>
    data.value.cities
      .filter((c) => c.slug)
      .map((c) => ({ value: c.slug as string, label: c.name })),
  )
  const destOptions = computed(() =>
    data.value.destinations
      .filter((d) => d.slug)
      .map((d) => ({ value: d.slug as string, label: d.name })),
  )
  const months = computed(() => monthsWithDepartures(data.value.departures))

  /* «Популярное» — соседние срезы того же каталога: на странице направления
     это города выезда, везде ещё — направления. Ссылки ведут на страницы,
     а не подставляют фильтр: такие адреса и в поиске нужны, и в меню. */
  const popular = computed(() => {
    if (props.lockDestination) {
      const byCity = new Map<string, number>()
      for (const t of base.value) {
        const seen = new Set<string>()
        for (const d of departuresOf(data.value.departures, t)) {
          const id = idOf(d.city)
          if (id) seen.add(id)
        }
        for (const id of seen) byCity.set(id, (byCity.get(id) ?? 0) + 1)
      }
      return data.value.cities
        .filter((c) => c.slug && byCity.get(c.id))
        .map((c) => ({
          key: c.id,
          label: c.name,
          count: byCity.get(c.id) as number,
          url: `/napravleniya/${props.lockDestination}?gorod=${c.slug}`,
        }))
        .sort((a, b) => b.count - a.count)
    }

    const byDest = new Map<string, number>()
    for (const t of base.value) {
      const slug = slugOfDestination(t)
      if (slug) byDest.set(slug, (byDest.get(slug) ?? 0) + 1)
    }
    return data.value.destinations
      .filter((d) => d.slug && byDest.get(d.slug as string))
      .map((d) => ({
        key: d.id,
        label: d.name,
        count: byDest.get(d.slug as string) as number,
        url: props.lockCity
          ? `/goroda/${props.lockCity}?napravlenie=${d.slug}`
          : destinationUrl(d),
      }))
      .sort((a, b) => b.count - a.count)
  })

  /* Показываем порциями: полсотни карточек разом — это долгая прокрутка и
     полсотни фотографий в первом кадре. «Показать ещё» вместо страниц, чтобы
     не терять уже просмотренное. */
  const PAGE = 9
  const shown = ref(PAGE)
  watch(query, () => (shown.value = PAGE), { deep: true })
  const visible = computed(() => rows.value.slice(0, shown.value))

  const filters = ref<InstanceType<typeof CatalogFilters> | null>(null)
  const results = ref<HTMLElement | null>(null)

  /* После «Найти» выдача должна оказаться перед глазами, а не под шапкой */
  watch(
    () => route.fullPath,
    () => {
      if (!import.meta.client) return
      const el = results.value
      if (el && el.getBoundingClientRect().top < 0) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    },
  )

  useSeoMeta({
    title: () => `${heading.value} — БогемаТур`,
    description: () => props.seoDescription ?? '',
  })
</script>

<template>
  <div class="page is-catalog">
    <CatalogHero
      :title="heading"
      :image="image"
      :facts="facts"
      :cities="cityOptions"
      :destinations="destOptions"
      :months="months"
      :query="query"
      :lock-city="!!lockCity"
      :lock-destination="!!lockDestination"
      :popular="popular"
      @refine="refine"
      @submit="submit"
    />

    <div class="wrap">
      <nav class="crumbs">
        <NuxtLink to="/">Главная</NuxtLink>
        <NuxtLink v-if="crumb !== 'Туры и экскурсии'" to="/tury"
          >Туры и экскурсии</NuxtLink
        >
        <span>{{ crumb }}</span>
      </nav>

      <div ref="results" class="catalog">
        <aside class="catalog-side">
          <CatalogFilters
            ref="filters"
            :destinations="data.destinations"
            :cities="data.cities"
            :departures="data.departures"
            :query="query"
            :lock-city="!!lockCity"
            :lock-destination="!!lockDestination"
            :price-bounds="priceBounds"
            :max-days="maxDays"
            :facet-groups="facetGroups"
            :total="rows.length"
            @change="apply"
          />
        </aside>

        <div class="catalog-main">
          <div class="catalog-top">
            <p class="catalog-found">
              Найдено {{ rows.length }}
              {{ plural(rows.length, 'тур', 'тура', 'туров') }}
            </p>
            <div class="catalog-tools">
              <button
                type="button"
                class="cfilters-toggle"
                @click="filters?.openSheet()"
              >
                Фильтры<span
                  v-if="filters?.activeCount"
                  class="cfilters-count"
                  >{{ filters.activeCount }}</span
                >
              </button>
              <label class="catalog-sort">
                <span>Сортировка</span>
                <SelectMenu
                  :model-value="
                    query.sort === 'date' ? null : (query.sort ?? null)
                  "
                  :options="SORTS"
                  all-label="Сначала ближайшие"
                  @update:model-value="
                    refine({ sort: ($event as SortKey) ?? 'date' })
                  "
                />
              </label>
            </div>
          </div>

          <div v-if="visible.length" class="dgrid catalog-grid">
            <TourCard
              v-for="row in visible"
              :key="row.tour.id"
              :tour="row.tour"
              :departures="row.departures"
            />
          </div>
          <p v-else class="catalog-empty">По этим условиям выездов нет.</p>

          <button
            v-if="shown < rows.length"
            type="button"
            class="catalog-more"
            @click="shown += PAGE"
          >
            Показать ещё
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
