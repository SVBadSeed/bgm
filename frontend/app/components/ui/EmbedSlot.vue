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
   *
   * Модуль рисуется своей вёрсткой и своими стилями с чужого сервера и про
   * тему сайта не знает. Днём это незаметно — его белое совпадает с нашим
   * полотном. Ночью белый прямоугольник посреди тёмной страницы выглядит
   * дырой, поэтому в тёмной теме мы не перекрашиваем чужое (сломалось бы на
   * первом же их обновлении), а оформляем как намеренную светлую вставку:
   * подложка, поля и подпись сверху. См. раздел 36 в refine.css.
   */
  const props = withDefaults(
    defineProps<{ code?: string | null; label?: string }>(),
    { code: null, label: 'Модуль системы бронирования' },
  )

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
    <p v-if="label" class="embed-cap">{{ label }}</p>
    <div class="embed-box">
      <div ref="host" class="embed-host"></div>
    </div>
  </div>
</template>
