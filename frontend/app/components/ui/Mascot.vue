<script setup lang="ts">
  /*
   * Маскот, выглядывающий из-за края полки. Снежный барс (ирбис).
   *
   * Персонаж светлый, а стоит он на белом фоне страницы, поэтому силуэт обведён
   * тёмным контуром — без него барс растворяется. Это не декор, это читаемость.
   *
   * Пока в Directus не загружена нарисованная версия (landing.mascot_image),
   * рисуется этот вектор — блок никогда не выходит пустым.
   * Требования к картинке и промпт — в docs/IMAGES.md.
   */
  import type { ImageRef } from '~/types/schema'

  const props = withDefaults(defineProps<{ image?: ImageRef }>(), {
    image: null,
  })

  const assetUrl = useAssetUrl()
  const src = computed(() =>
    assetUrl(props.image, { width: 440, format: 'webp' }),
  )
</script>

<template>
  <div class="mascot" aria-hidden="true">
    <img v-if="src" :src="src" alt="" />
    <svg
      v-else
      viewBox="0 0 260 210"
      xmlns="http://www.w3.org/2000/svg"
      stroke="#4C5666"
      stroke-width="3.4"
      stroke-linejoin="round"
    >
      <!-- пушистые щёки: торчат из-за головы -->
      <g fill="#DDE4EC">
        <path d="M72 106L50 99L68 122Z" />
        <path d="M67 134L44 136L68 150Z" />
        <path d="M188 106L210 99L192 122Z" />
        <path d="M193 134L216 136L192 150Z" />
      </g>

      <!-- уши -->
      <path d="M78 98C70 72 84 54 106 56c4 16-6 32-14 42Z" fill="#DDE4EC" />
      <path d="M182 98c8-26-6-44-28-42-4 16 6 32 14 42Z" fill="#DDE4EC" />
      <path
        d="M88 92C83 74 91 62 103 64c2 11-7 21-13 28Z"
        fill="#9AA5B4"
        stroke="none"
      />
      <path
        d="M172 92c5-18-3-30-15-28-2 11 7 21 13 28Z"
        fill="#9AA5B4"
        stroke="none"
      />

      <!-- голова -->
      <path
        d="M130 50c43 0 67 30 67 68 0 39-29 62-67 62s-67-23-67-62c0-38 24-68 67-68Z"
        fill="#EDF1F6"
      />
      <path
        d="M130 50c43 0 67 30 67 68 0 4 0 8-1 11-10-33-34-51-66-51s-56 18-66 51c-1-3-1-7-1-11 0-38 24-68 67-68Z"
        fill="#D7DFE9"
        stroke="none"
      />

      <!-- розетки: кольца, а не сплошные пятна -->
      <g stroke="#4C5666" stroke-width="3.2" fill="none">
        <circle cx="80" cy="118" r="9" />
        <circle cx="180" cy="118" r="9" />
        <circle cx="79" cy="145" r="7.5" />
        <circle cx="181" cy="145" r="7.5" />
      </g>
      <g fill="#4C5666" stroke="none">
        <circle cx="112" cy="73" r="4" />
        <circle cx="130" cy="68" r="4" />
        <circle cx="148" cy="73" r="4" />
        <circle cx="99" cy="88" r="3.6" />
        <circle cx="161" cy="88" r="3.6" />
        <circle cx="80" cy="118" r="2.6" />
        <circle cx="180" cy="118" r="2.6" />
      </g>

      <!-- морда -->
      <path
        d="M99 126c0-12 62-12 62 0 0 30-13 48-31 48s-31-18-31-48Z"
        fill="#FBFCFE"
      />

      <!-- глаза: льдисто-зелёные -->
      <path d="M92 106c6-13 30-13 36 0-6 13-30 13-36 0Z" fill="#9FD3D6" />
      <path d="M132 106c6-13 30-13 36 0-6 13-30 13-36 0Z" fill="#9FD3D6" />
      <ellipse cx="110" cy="106" rx="6" ry="8.5" fill="#1B2129" stroke="none" />
      <ellipse cx="150" cy="106" rx="6" ry="8.5" fill="#1B2129" stroke="none" />
      <circle cx="113" cy="102" r="2.7" fill="#fff" stroke="none" />
      <circle cx="153" cy="102" r="2.7" fill="#fff" stroke="none" />

      <!-- нос, рот, усы -->
      <path
        d="M121 126h18c2 7-4 12-9 15-5-3-11-8-9-15Z"
        fill="#4C5666"
        stroke="none"
      />
      <path
        d="M130 141v6M117 150c3 7 10 7 13-3M143 150c-3 7-10 7-13-3"
        stroke="#4C5666"
        stroke-width="3"
        stroke-linecap="round"
        fill="none"
      />
      <g
        stroke="#4C5666"
        stroke-width="2.6"
        stroke-linecap="round"
        opacity=".55"
        fill="none"
      >
        <path d="M97 137l-27-7M97 146l-28 5" />
        <path d="M163 137l27-7M163 146l28 5" />
      </g>

      <!-- шейный платок: тёмная масса, которая держит силуэт -->
      <path
        d="M96 168c12 12 56 12 68 0l8 18c-18 13-66 13-84 0l8-18Z"
        fill="#0A0A0A"
        stroke="none"
      />
      <path d="M158 180l19 6-6 18-16-11 3-13Z" fill="#0A0A0A" stroke="none" />

      <!-- лапы на краю полки -->
      <g fill="#EDF1F6">
        <rect x="62" y="166" width="50" height="44" rx="22" />
        <rect x="148" y="166" width="50" height="44" rx="22" />
      </g>
      <g stroke="#9AA5B4" stroke-width="3" stroke-linecap="round" fill="none">
        <path d="M79 194v16M95 194v16" />
        <path d="M165 194v16M181 194v16" />
      </g>
      <g fill="#4C5666" stroke="none" opacity=".8">
        <circle cx="87" cy="181" r="3.2" />
        <circle cx="173" cy="181" r="3.2" />
      </g>
    </svg>
  </div>
</template>
