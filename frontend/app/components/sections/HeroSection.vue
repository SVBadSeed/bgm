<script setup lang="ts">
  /*
   * Hero: ротация слайдов раз в 6 с, пауза при наведении, точки-переключатели
   * (они же индикатор времени до смены кадра), строка «На фото» под карточкой.
   */
  import type { HeroSlide } from '~/types/schema'

  const props = defineProps<{
    slides: HeroSlide[]
    title: string | null
    placeholder: string | null
  }>()

  const cur = ref(0)
  const paused = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  const current = computed(() => props.slides[cur.value] ?? null)
  /* Знаки внутри строки разбирает splitTitleLines: тем же приёмом
     пользуется промо-полоса, поэтому логика лежит в utils, а не здесь. */
  const titleLines = computed(() => splitTitleLines(props.title))

  function show(i: number) {
    const n = props.slides.length
    if (!n) return
    cur.value = ((i % n) + n) % n
  }
  function stop() {
    if (timer) clearInterval(timer)
    timer = null
  }
  function restart() {
    stop()
    if (props.slides.length > 1)
      timer = setInterval(() => show(cur.value + 1), 6000)
  }
  function pick(i: number) {
    show(i)
    restart()
  }
  /* Отдельные методы, а не выражения в шаблоне: без точек с запятой
     (prettier их убирает) Vue не разбирает многострочный обработчик. */
  function onEnter() {
    stop()
    paused.value = true
  }
  function onLeave() {
    restart()
    paused.value = false
  }

  onMounted(restart)
  onBeforeUnmount(stop)

  const query = ref('')
  function onSearch() {
    // TODO: поиск по каталогу — когда появится страница /tours
    if (query.value.trim()) window.location.hash = '#tours'
  }
</script>

<template>
  <div
    class="hero-card"
    :class="{ 'is-paused': paused }"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <div class="hero-media">
      <div
        v-for="(s, i) in slides"
        :key="s.id"
        class="hero-shot"
        :class="{ on: i === cur }"
        :data-city="s.title"
        :data-count="s.subtitle ?? ''"
      >
        <MediaSlot
          :image="s.image"
          :alt="s.title"
          :placeholder="s.title"
          :loading="i === 0 ? 'eager' : 'lazy'"
          :transform="{ width: 1800, height: 900 }"
        />
      </div>
      <div class="hero-veil"></div>
    </div>

    <div class="hero-in">
      <h1 class="hero-title">
        <span v-for="(line, i) in titleLines" :key="i" class="hl">
          <i :style="{ '--i': i }">
            <template v-for="(part, j) in line" :key="j">
              <TitleIcon v-if="part.icon" :name="part.icon" />
              <template v-else>{{ part.text }}</template>
            </template>
          </i>
        </span>
      </h1>
      <form class="hero-search" @submit.prevent="onSearch">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9A9AA4"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          v-model="query"
          type="text"
          :placeholder="placeholder ?? 'Куда поедем?'"
        />
      </form>
    </div>

    <div v-if="slides.length > 1" class="shot-dots">
      <button
        v-for="(s, i) in slides"
        :key="s.id"
        type="button"
        :class="{ on: i === cur }"
        :aria-label="`Кадр ${i + 1}: ${s.title}`"
        @click="pick(i)"
      ></button>
    </div>
  </div>

  <div v-if="current" class="shot-line">
    <span class="shot-pill ticket">На фото</span>
    <a class="shot-where" :href="current.url ?? '#dests'">
      <span>{{ current.title }}</span>
      <em v-if="current.subtitle">·</em>
      <em v-if="current.subtitle">{{ current.subtitle }}</em>
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </a>
  </div>
</template>
