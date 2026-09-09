<script setup lang="ts">
  /*
   * Панель разделов тура: белая полоса под галереей со ссылками-якорями.
   * Страница длинная, и без неё до расписания дат приходится долистывать
   * весь маршрут — а именно за датами сюда чаще всего и приходят.
   *
   * Панель — вторая шапка: полоса во всю ширину, прижатая под основной.
   * Плавающая карточка посреди страницы читалась как случайно всплывший
   * блок; полоса же явно говорит, что это навигация.
   *
   * Активный раздел подсвечивается по тому, какой заголовок сейчас под
   * панелью: подсветка «по клику» врёт, стоит человеку листать самому.
   */
  const props = defineProps<{
    items: { id: string; label: string }[]
  }>()

  const active = ref<string | null>(null)

  function onScroll() {
    /* Активен последний раздел, начало которого прошло под панелью */
    let current: string | null = null
    for (const item of props.items) {
      const el = document.getElementById(item.id)
      if (el && el.getBoundingClientRect().top <= 152) current = item.id
    }
    active.value = current ?? props.items[0]?.id ?? null
  }

  function go(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - 148
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  onMounted(() => {
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
  })
  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <nav v-if="items.length > 1" class="tnav">
    <div class="wrap tnav-in">
      <button
        v-for="i in items"
        :key="i.id"
        type="button"
        class="tnav-item"
        :class="{ on: active === i.id }"
        @click="go(i.id)"
      >
        {{ i.label }}
      </button>
    </div>
  </nav>
</template>
