<script setup lang="ts">
  /*
   * «Когда»: точная дата или месяц — одним контролом.
   *
   * Это один вопрос, просто отвечают на него по-разному: у одного отпуск
   * с двенадцатого, другой смотрит «что вообще есть в октябре». Раньше здесь
   * был только список месяцев, и человек с готовыми датами не мог сказать
   * главного о своей поездке.
   *
   * В календаре кликабельны только дни, в которые есть выезды: щёлкнуть по
   * пустой дате и получить «ничего не найдено» — это не ответ, а тупик.
   *
   * «± 3 дня» включён по умолчанию: у автобусного тура выезды раз в неделю,
   * и поиск ровно по одному числу почти всегда пустой. Кому нужен строго
   * конкретный день — выключит.
   */
  const props = defineProps<{
    /** Месяцы с выездами, YYYY-MM */
    months: { value: string; label: string }[]
    /** Даты выездов, YYYY-MM-DD */
    days: string[]
    month: string[]
    from: string | null
    to: string | null
    /* В колонке фильтров календарь стоит развёрнутым: там для него есть
       место, а всплывающую панель обрезала бы анимация сворачивания группы. */
    inline?: boolean
  }>()

  const emit = defineEmits<{
    change: [{ month: string[]; from: string | null; to: string | null }]
  }>()

  const SPREAD = 3
  const WEEKDAYS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']
  const SHORT = [
    'Янв',
    'Фев',
    'Мар',
    'Апр',
    'Май',
    'Июн',
    'Июл',
    'Авг',
    'Сен',
    'Окт',
    'Ноя',
    'Дек',
  ]

  /* Дату собираем из локальных частей: toISOString() уводит на UTC, и поздним
     вечером 29-го календарь подсвечивал бы 28-е. */
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`
  const parse = (s: string) => {
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
  }
  const shift = (s: string, n: number) => {
    const d = parse(s)
    d.setDate(d.getDate() + n)
    return iso(d)
  }
  const key = (y: number, i: number) => `${y}-${String(i + 1).padStart(2, '0')}`

  const open = ref(false)
  const root = ref<HTMLElement | null>(null)
  const tab = ref<'day' | 'month'>('day')
  const spread = ref(true)
  const picked = ref<string | null>(null)
  const cursor = ref('')
  const year = ref(new Date().getFullYear())

  const daySet = computed(() => new Set(props.days))
  const monthSet = computed(() => new Set(props.months.map((m) => m.value)))
  const firstMonth = computed(
    () => props.months[0]?.value ?? iso(new Date()).slice(0, 7),
  )
  const lastMonth = computed(
    () => props.months[props.months.length - 1]?.value ?? firstMonth.value,
  )
  const years = computed(() => [
    ...new Set(props.months.map((m) => Number(m.value.slice(0, 4)))),
  ])

  /*
   * Состояние живёт в адресе, а не здесь: подборку присылают ссылкой, и
   * открытый календарь должен показывать то же, что написано в поле. Отрезок
   * ровно в семь дней узнаём как «день ± 3».
   */
  function sync() {
    const { from, to } = props
    if (from && to && from !== to) {
      const days = Math.round(
        (parse(to).getTime() - parse(from).getTime()) / 86400000,
      )
      spread.value = days === SPREAD * 2
      picked.value = spread.value ? shift(from, SPREAD) : from
    } else if (from) {
      spread.value = false
      picked.value = from
    } else {
      picked.value = null
    }
    tab.value = props.month.length && !picked.value ? 'month' : 'day'
    cursor.value =
      picked.value?.slice(0, 7) ?? props.month[0] ?? firstMonth.value
    year.value = Number((props.month[0] ?? firstMonth.value).slice(0, 4))
  }
  watch(() => [props.from, props.to, props.month] as const, sync, {
    immediate: true,
    deep: true,
  })

  const monthLabel = (value: string) =>
    props.months.find((m) => m.value === value)?.label ?? value

  const label = computed(() => {
    if (picked.value) {
      const d = formatDate(picked.value)
      return spread.value ? `${d} ± ${SPREAD} дня` : d
    }
    if (props.from || props.to) {
      return formatRange(props.from ?? (props.to as string), props.to)
    }
    if (props.month.length) {
      const first = monthLabel(props.month[0] as string)
      return props.month.length > 1
        ? `${first} +${props.month.length - 1}`
        : first
    }
    return null
  })

  function inSelection(day: string): boolean {
    const { from, to } = props
    if (!from && !to) return false
    if (from && to) return day >= from && day <= to
    return day === (from ?? to)
  }

  /* Клетки календаря: недели от понедельника. Неделю, целиком принадлежащую
     соседнему месяцу, не рисуем — пустой ряд внизу читается как сбой. */
  const weeks = computed(() => {
    const [y, m] = cursor.value.split('-').map(Number)
    if (!y || !m) return []
    const first = new Date(y, m - 1, 1)
    const start = new Date(y, m - 1, 1 - ((first.getDay() + 6) % 7))
    const rows: {
      id: string
      day: number
      out: boolean
      has: boolean
      on: boolean
    }[][] = []
    for (let w = 0; w < 6; w++) {
      const row = []
      for (let i = 0; i < 7; i++) {
        const d = new Date(start)
        d.setDate(start.getDate() + w * 7 + i)
        const id = iso(d)
        row.push({
          id,
          day: d.getDate(),
          out: d.getMonth() !== m - 1,
          has: daySet.value.has(id),
          on: inSelection(id),
        })
      }
      if (row.some((c) => !c.out)) rows.push(row)
    }
    return rows
  })

  const cursorLabel = computed(() => {
    const [y, m] = cursor.value.split('-').map(Number)
    if (!y || !m) return ''
    const named = props.months.find((x) => x.value === cursor.value)
    const name = named ? (named.label.split(' ')[0] as string) : SHORT[m - 1]
    return `${name}, ${y}`
  })

  const canPrev = computed(() => cursor.value > firstMonth.value)
  const canNext = computed(() => cursor.value < lastMonth.value)

  function moveMonth(step: 1 | -1) {
    const [y, m] = cursor.value.split('-').map(Number)
    const d = new Date(y ?? 1970, (m ?? 1) - 1 + step, 1)
    cursor.value = iso(d).slice(0, 7)
  }

  function pickDay(day: string) {
    picked.value = day
    push()
  }

  function toggleSpread() {
    spread.value = !spread.value
    if (picked.value) push()
  }

  /* Даты и месяцы — два ответа на один вопрос, поэтому выбор одного снимает
     другой: «октябрь и при этом 12–18 октября» ничего не уточняет. */
  function push() {
    const day = picked.value
    if (!day) {
      emit('change', { month: [], from: null, to: null })
      return
    }
    emit('change', {
      month: [],
      from: spread.value ? shift(day, -SPREAD) : day,
      to: spread.value ? shift(day, SPREAD) : day,
    })
  }

  function toggleMonth(value: string) {
    picked.value = null
    const now = props.month
    emit('change', {
      month: now.includes(value)
        ? now.filter((v) => v !== value)
        : [...now, value],
      from: null,
      to: null,
    })
  }

  function clear() {
    picked.value = null
    emit('change', { month: [], from: null, to: null })
  }

  function onDocClick(e: MouseEvent) {
    if (open.value && !root.value?.contains(e.target as Node)) open.value = false
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') open.value = false
  }
  onMounted(() => {
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('click', onDocClick)
    document.removeEventListener('keydown', onKey)
  })
</script>

<template>
  <div ref="root" class="selm wpick" :class="{ open, 'is-inline': inline }">
    <button
      v-if="!inline"
      type="button"
      class="selm-btn"
      :class="{ chosen: !!label }"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span>{{ label ?? 'Любые даты' }}</span>
      <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
        <rect
          x="3.2"
          y="5"
          width="17.6"
          height="16"
          rx="3"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        />
        <path
          d="M3.2 10h17.6M8 3v4M16 3v4"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        />
      </svg>
    </button>

    <Transition name="selm">
      <div v-if="inline || open" class="wpick-pop">
        <div class="wpick-tabs">
          <button
            type="button"
            :class="{ on: tab === 'day' }"
            @click="tab = 'day'"
          >
            Точные даты
          </button>
          <button
            type="button"
            :class="{ on: tab === 'month' }"
            @click="tab = 'month'"
          >
            Месяц
          </button>
        </div>

        <div v-if="tab === 'day'" class="wpick-cal">
          <div class="wpick-nav">
            <button
              type="button"
              :disabled="!canPrev"
              aria-label="Предыдущий месяц"
              @click="moveMonth(-1)"
            >
              ‹
            </button>
            <b>{{ cursorLabel }}</b>
            <button
              type="button"
              :disabled="!canNext"
              aria-label="Следующий месяц"
              @click="moveMonth(1)"
            >
              ›
            </button>
          </div>
          <div class="wpick-wd">
            <span v-for="w in WEEKDAYS" :key="w">{{ w }}</span>
          </div>
          <div v-for="(week, i) in weeks" :key="i" class="wpick-week">
            <button
              v-for="c in week"
              :key="c.id"
              type="button"
              class="wpick-day"
              :class="{ out: c.out, has: c.has, on: c.on }"
              :disabled="!c.has"
              @click="pickDay(c.id)"
            >
              {{ c.day }}
            </button>
          </div>
        </div>

        <div v-else class="wpick-months">
          <div class="wpick-nav">
            <button
              type="button"
              :disabled="!years.includes(year - 1)"
              aria-label="Предыдущий год"
              @click="year -= 1"
            >
              ‹
            </button>
            <b>{{ year }}</b>
            <button
              type="button"
              :disabled="!years.includes(year + 1)"
              aria-label="Следующий год"
              @click="year += 1"
            >
              ›
            </button>
          </div>
          <div class="wpick-grid">
            <button
              v-for="(m, i) in SHORT"
              :key="m"
              type="button"
              class="wpick-m"
              :class="{ on: month.includes(key(year, i)) }"
              :disabled="!monthSet.has(key(year, i))"
              @click="toggleMonth(key(year, i))"
            >
              {{ m }}
            </button>
          </div>
        </div>

        <div class="wpick-foot">
          <button
            type="button"
            class="wpick-clear"
            :disabled="!label"
            @click="clear"
          >
            ✕ Сбросить
          </button>
          <button
            v-if="tab === 'day'"
            type="button"
            class="wpick-spread"
            :class="{ on: spread }"
            :aria-pressed="spread"
            @click="toggleSpread"
          >
            ± {{ SPREAD }} дня <i aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
