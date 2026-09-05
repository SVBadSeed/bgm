<script setup lang="ts">
  /*
   * Строка навигации с выпадающими списками. Одна на шапку над кадром и на
   * липкую панель: раньше панель показывала плоские ссылки, и разделы с
   * подпунктами из неё было не достать.
   *
   * Меню — дерево: пункты без родителя стоят в строке, пункты с родителем
   * уходят в его список. Исключение одно: «Направления» тянут список из своей
   * коллекции — вести те же регионы ещё и в меню значит держать два списка,
   * которые разъедутся.
   */
  import type { Destination, MenuItem } from '~/types/schema'

  const props = withDefaults(
    defineProps<{
      menu: MenuItem[]
      destinations?: Destination[]
      allUrl?: string | null
      /* Панель приезжает скрытой, и её ссылки не должны ловить фокус */
      focusable?: boolean
    }>(),
    { destinations: () => [], allUrl: null, focusable: true },
  )

  const header = computed(() =>
    props.menu.filter((m) => m.placement === 'header'),
  )
  const items = computed(() => header.value.filter((m) => !m.parent))

  const isDests = (m: MenuItem) =>
    props.destinations.length > 0 && /направлен/i.test(m.label)

  type Link = { key: string; label: string; url: string }
  function submenu(m: MenuItem): Link[] {
    const own = header.value.filter((c) => c.parent === m.id)
    if (own.length) {
      return own.map((c) => ({ key: c.id, label: c.label, url: c.url }))
    }
    if (isDests(m)) {
      return props.destinations.map((d) => ({
        key: d.id,
        label: d.name,
        url: d.url ?? '#',
      }))
    }
    return []
  }

  const hasDrop = (m: MenuItem) => submenu(m).length > 0
  /* id раскрытого пункта: списков несколько, одного флага мало */
  const drop = ref<string | null>(null)
  const tab = computed(() => (props.focusable ? 0 : -1))
</script>

<template>
  <template v-for="m in items" :key="m.id">
    <div
      v-if="hasDrop(m)"
      class="nav-drop"
      :class="{ on: drop === m.id, wide: isDests(m) }"
      @mouseenter="drop = m.id"
      @mouseleave="drop = null"
    >
      <a :href="m.url" :tabindex="tab" @focus="drop = m.id">
        {{ m.label }}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </a>
      <div class="nav-menu">
        <a
          v-for="l in submenu(m)"
          :key="l.key"
          :href="l.url"
          :tabindex="tab"
          >{{ l.label }}</a
        >
        <a
          v-if="isDests(m) && allUrl"
          class="nav-menu-all"
          :href="allUrl"
          :tabindex="tab"
          >Все направления</a
        >
      </div>
    </div>
    <a v-else :href="m.url" :tabindex="tab">{{ m.label }}</a>
  </template>
</template>
