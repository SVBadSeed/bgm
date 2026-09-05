<script setup lang="ts">
  /*
   * Горизонтальная лента карточек со скроллом. Стрелки живут снаружи
   * (в sec-head) и дёргают go(±1); состояние краёв — atStart / atEnd.
   *
   * Ширину карточки задаёт CSS (--cards в motion.css): в кадр всегда попадает
   * целое число карточек. Стрелка листает ровно на кадр, а не на две карточки.
   */
  const track = ref<HTMLElement | null>(null)
  const atStart = ref(true)
  const atEnd = ref(false)

  function step() {
    const card = track.value?.firstElementChild as HTMLElement | null
    if (!card) return 340
    const gap = parseFloat(getComputedStyle(track.value!).columnGap) || 18
    return card.getBoundingClientRect().width + gap
  }

  function sync() {
    const el = track.value
    if (!el) return
    const max = el.scrollWidth - el.clientWidth - 2
    atStart.value = el.scrollLeft <= 2
    atEnd.value = el.scrollLeft >= max
  }

  function go(dir: 1 | -1) {
    const el = track.value
    if (!el) return
    const s = step()
    const perView = Math.max(1, Math.round(el.clientWidth / s))
    el.scrollBy({ left: dir * s * perView, behavior: 'smooth' })
  }

  onMounted(() => {
    sync()
    window.addEventListener('resize', sync)
  })
  onBeforeUnmount(() => window.removeEventListener('resize', sync))

  defineExpose({ go, atStart, atEnd })
</script>

<template>
  <div ref="track" class="rail-track" @scroll.passive="sync">
    <slot />
  </div>
</template>
