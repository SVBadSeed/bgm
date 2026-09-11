<script setup lang="ts">
  /*
   * Кнопка «день/ночь» в шапке.
   *
   * Обе иконки лежат в разметке всегда, показывает нужную CSS по
   * data-theme на <html>. Так сервер и браузер отдают одно и то же: тему
   * браузер узнаёт только у себя, и если бы иконку выбирал шаблон, Vue
   * при гидратации нашёл бы расхождение и перерисовал шапку.
   *
   * Подпись у кнопки не меняется по той же причине — и потому, что
   * «Светлая или тёмная тема» честнее описывает, что произойдёт, чем
   * «Включить тёмную» на кнопке, которая работает в обе стороны.
   */
  const { toggle } = useTheme()
</script>

<template>
  <button
    class="hd-theme"
    type="button"
    data-keep-menu
    title="Светлая или тёмная тема"
    aria-label="Светлая или тёмная тема"
    @click="toggle"
  >
    <svg
      class="th-sun"
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path
        d="M12 2.6v2.2M12 19.2v2.2M4.2 12H2M22 12h-2.2M6.5 6.5 4.9 4.9M19.1 19.1l-1.6-1.6M17.5 6.5l1.6-1.6M4.9 19.1l1.6-1.6"
      />
    </svg>
    <svg
      class="th-moon"
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M20.4 14.3A8.6 8.6 0 0 1 9.7 3.6a8.6 8.6 0 1 0 10.7 10.7Z" />
    </svg>
  </button>
</template>
