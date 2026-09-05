<script setup lang="ts">
  /*
   * Каркас автобуса для «Почему выбирают нас». Вектор перерисован примитивами
   * по обмеру исходного PNG: кузов и рамка окон — скруглённые прямоугольники,
   * арки и колёса — окружности, спицы — восемь лучей через 45°.
   * Разметка встроена, а не подключена картинкой, чтобы колёса могли крутиться.
   *
   * Колёса докручиваются от прокрутки: пока блок идёт по экрану, автобус «в
   * пути». Кузов при этом стоит — сдвинь его, и текст в окнах разъедется
   * с рамками. Угол считаем в JS, а не через animation-timeline: view():
   * у SVG-группы нет собственного блока, и таймлайн на ней застывает.
   */
  const root = ref<HTMLElement | null>(null)
  let frame = 0
  let queued = false

  function update() {
    queued = false
    const el = root.value
    if (!el) return
    const r = el.getBoundingClientRect()
    /* 0 — блок только показался снизу, 1 — ушёл за верхнюю кромку */
    const p = (window.innerHeight - r.top) / (window.innerHeight + r.height)
    const turn = Math.min(Math.max(p, 0), 1) * 720
    el.style.setProperty('--roll', `${turn.toFixed(1)}deg`)
  }

  function onScroll() {
    if (queued) return
    queued = true
    frame = requestAnimationFrame(update)
  }

  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(frame)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  })
</script>

<template>
  <div ref="root" class="bus-frame">
<svg
      class="bus-svg"
      viewBox="34 112 1308 428"
      fill="none"
      stroke="url(#busLime)"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="busLime"
          x1="35"
          y1="113"
          x2="1331"
          y2="519"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stop-color="#E4FF6E" />
          <stop offset="0.45" stop-color="#AEF63F" />
          <stop offset="1" stop-color="#60C714" />
        </linearGradient>
      </defs>
      <path class="bus-body" d="M 40.0 166.3 A 48.3 48.3 0 0 1 88.3 118.0 L 1222.4 118.0 A 112.6 112.6 0 0 1 1335.0 230.6 L 1335.0 417.6 A 72.4 72.4 0 0 1 1262.6 490.0 L 1196.0 490.0 A 85.8 85.8 0 0 0 1032.0 490.0 L 427.0 490.0 A 85.8 85.8 0 0 0 263.0 490.0 L 94.7 490.0 A 54.7 54.7 0 0 1 40.0 435.3 Z" stroke-width="10"/>
      <path d="M 90.0 145.0 L 1230.3 145.0 A 77.7 74.5 0 0 1 1308.0 219.5 L 1308.0 394.0 A 26.0 26.0 0 0 1 1282.0 420.0 L 90.5 420.0 A 28.5 28.5 0 0 1 62.0 391.5 L 62.0 173.0 A 28.0 28.0 0 0 1 90.0 145.0 Z" stroke-width="6"/>
      <path d="M 485.0 145.0 L 485.0 420.0 M 907.0 145.0 L 907.0 420.0" stroke-width="6"/>
      <path class="bus-skirt" d="M 76.5 445.0 L 250.5 445.0 M 439.5 445.0 L 1019.5 445.0 M 1208.5 445.0 L 1293.5 445.0" stroke-width="6"/>
      <path d="M 40 354.5 L 59 354.5 L 59 386.5 L 40 386.5" stroke-width="5"/>
      <path d="M 1280.5 439 L 1307 439 L 1307 457 L 1271.5 457" stroke-width="6"/>
      <g class="bus-wheel" style="transform-origin: 345.0px 490.0px">
        <circle cx="345.0" cy="490.0" r="44.0" stroke-width="9"/>
        <circle cx="345.0" cy="490.0" r="27.0" stroke-width="5.5"/>
        <circle cx="345.0" cy="490.0" r="8.0" stroke-width="5.3"/>
        <path d="M 355.5 490.0 L 370.5 490.0" stroke-width="4.5"/>
        <path d="M 352.4 497.4 L 363.0 508.0" stroke-width="4.5"/>
        <path d="M 345.0 500.5 L 345.0 515.5" stroke-width="4.5"/>
        <path d="M 337.6 497.4 L 327.0 508.0" stroke-width="4.5"/>
        <path d="M 334.5 490.0 L 319.5 490.0" stroke-width="4.5"/>
        <path d="M 337.6 482.6 L 327.0 472.0" stroke-width="4.5"/>
        <path d="M 345.0 479.5 L 345.0 464.5" stroke-width="4.5"/>
        <path d="M 352.4 482.6 L 363.0 472.0" stroke-width="4.5"/>
      </g>
      <g class="bus-wheel" style="transform-origin: 1114.0px 490.0px">
        <circle cx="1114.0" cy="490.0" r="44.0" stroke-width="9"/>
        <circle cx="1114.0" cy="490.0" r="27.0" stroke-width="5.5"/>
        <circle cx="1114.0" cy="490.0" r="8.0" stroke-width="5.3"/>
        <path d="M 1124.5 490.0 L 1139.5 490.0" stroke-width="4.5"/>
        <path d="M 1121.4 497.4 L 1132.0 508.0" stroke-width="4.5"/>
        <path d="M 1114.0 500.5 L 1114.0 515.5" stroke-width="4.5"/>
        <path d="M 1106.6 497.4 L 1096.0 508.0" stroke-width="4.5"/>
        <path d="M 1103.5 490.0 L 1088.5 490.0" stroke-width="4.5"/>
        <path d="M 1106.6 482.6 L 1096.0 472.0" stroke-width="4.5"/>
        <path d="M 1114.0 479.5 L 1114.0 464.5" stroke-width="4.5"/>
        <path d="M 1121.4 482.6 L 1132.0 472.0" stroke-width="4.5"/>
      </g>
    </svg>
  </div>
</template>
