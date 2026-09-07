<script setup lang="ts">
  /*
   * Место под чужой модуль подбора туров. Код приходит из админки целиком —
   * партнёрские виджеты меняются вместе с договором, и каждая такая замена
   * должна быть правкой в CMS, а не релизом фронта.
   *
   * v-html здесь не годится: браузер не выполняет <script>, вставленные через
   * innerHTML. Поэтому разбираем разметку и пересоздаём теги скриптов руками,
   * иначе виджет не поднимется. Вставляем только на клиенте — чужой скрипт на
   * сервере рендерить нечем.
   *
   * Поле редактирует администратор сайта, поэтому содержимое считаем
   * доверенным: это тот же уровень доступа, что и правка шаблона.
   */
  const props = defineProps<{ code?: string | null; note?: string | null }>()

  const host = ref<HTMLElement | null>(null)

  function mount() {
    const el = host.value
    if (!el) return
    el.innerHTML = ''
    const code = props.code?.trim()
    if (!code) return

    const tpl = document.createElement('template')
    tpl.innerHTML = code
    const scripts = [...tpl.content.querySelectorAll('script')]
    scripts.forEach((s) => s.remove())
    el.appendChild(tpl.content)

    /* Скрипты добавляем после разметки: виджеты обычно ищут свой контейнер
       сразу при загрузке, и порядок здесь — не придирка. */
    for (const src of scripts) {
      const tag = document.createElement('script')
      for (const attr of src.attributes) {
        tag.setAttribute(attr.name, attr.value)
      }
      tag.text = src.text
      el.appendChild(tag)
    }
  }

  onMounted(mount)
  watch(() => props.code, mount)
</script>

<template>
  <div class="embed">
    <div ref="host" class="embed-host"></div>
    <p v-if="note" class="embed-note">{{ note }}</p>
  </div>
</template>
