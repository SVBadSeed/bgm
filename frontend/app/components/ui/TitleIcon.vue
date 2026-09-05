<script setup lang="ts">
  /*
   * Знаки внутри крупных заголовков: горы и карта маршрута. Ставятся между
   * словами через плейсхолдеры {mountains} и {route} в тексте заголовка,
   * поэтому редактор в Directus сам решает, где им стоять.
   * Цвет — currentColor, размер — от кегля строки.
   */
  defineProps<{ name: TitleIconName }>()
</script>

<template>
  <span class="ticon" :class="`ticon--${name}`" aria-hidden="true">
    <template v-if="name === 'mountains'">
      <svg class="ticon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Горы Богематур">
        <path fill="currentColor" d="M7 105L30 67C34 60 41 59 46 65L53 74L74 34C79 24 89 23 95 32L122 102C126 112 120 119 109 119H19C8 119 2 113 7 105Z"/>
        <path fill="currentColor" d="M20 93L35 43C38 34 47 32 53 40L66 58L55 80L46 68C41 61 34 61 30 68L20 93Z"/>
      </svg>
    </template>
    <template v-else-if="name === 'loop'">
      <svg
        class="ticon-svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 128 128"
        role="img"
        aria-label="Петля маршрута Богематур"
      >
        <path fill="currentColor" fill-rule="evenodd" d="M61 12C87 11 108 28 111 51C114 72 101 89 82 95C69 99 61 105 58 115C56 123 47 126 40 121C34 117 34 109 38 102C43 93 50 88 61 84C45 82 32 75 26 64C18 49 23 31 37 21C44 16 52 13 61 12ZM62 39C51 39 44 45 44 54C44 63 52 69 64 69C77 69 85 63 85 54C85 45 76 39 62 39Z" />
        <circle cx="106" cy="89" r="10" fill="currentColor" />
      </svg>
    </template>
    <template v-else-if="name === 'paw'">
      <svg
        class="ticon-svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 128 128"
        role="img"
        aria-label="След снежного барса"
      >
        <ellipse
          cx="31"
          cy="39"
          rx="13"
          ry="17"
          transform="rotate(-28 31 39)"
          fill="currentColor"
        />
        <ellipse
          cx="55"
          cy="25"
          rx="13"
          ry="17"
          transform="rotate(-7 55 25)"
          fill="currentColor"
        />
        <ellipse
          cx="82"
          cy="28"
          rx="13"
          ry="17"
          transform="rotate(14 82 28)"
          fill="currentColor"
        />
        <ellipse
          cx="103"
          cy="47"
          rx="12"
          ry="16"
          transform="rotate(31 103 47)"
          fill="currentColor"
        />
        <path fill="currentColor" d="M64 48C76 48 82 57 88 67C94 77 106 84 105 96C104 111 91 117 78 113C69 110 61 110 51 114C37 120 22 112 22 97C22 85 34 78 40 67C46 56 52 48 64 48Z" />
      </svg>
    </template>
    <template v-else>
      <svg class="ticon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Карта маршрута Богематур">
        <defs>
          <mask id="ticon-route-cut">
            <rect width="128" height="128" fill="white"/>
            <path d="M25 91C43 80 31 62 50 55C69 48 66 73 84 66C96 61 91 45 103 38" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/>
            <circle cx="25" cy="91" r="7" fill="black"/>
            <circle cx="103" cy="38" r="4" fill="black"/>
          </mask>
        </defs>
        <path fill="currentColor" mask="url(#ticon-route-cut)" d="M8 27C8 21 13 17 19 19L42 27L68 16C71 15 74 15 77 17L104 26L116 20C121 18 125 22 125 27V101C125 106 122 110 117 112L106 116C103 117 100 117 97 116L73 108L47 119C44 120 41 120 38 119L13 110C10 109 8 106 8 102V27Z"/>
        <circle cx="103" cy="38" r="11" fill="currentColor" mask="url(#ticon-route-cut)"/>
      </svg>
    </template>
  </span>
</template>
