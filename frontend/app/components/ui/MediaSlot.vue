<script setup lang="ts">
  /*
   * Картинка Directus или заглушка. Замена <image-slot> из прототипа:
   * с картинкой — <img class="slot">, без — <span class="slot slot-empty">.
   */
  import type { ImageRef } from '~/types/schema'
  import type { AssetOptions } from '~/composables/useAssetUrl'

  const props = withDefaults(
    defineProps<{
      image?: ImageRef
      alt?: string
      placeholder?: string
      loading?: 'lazy' | 'eager'
      transform?: AssetOptions
    }>(),
    {
      image: null,
      alt: '',
      placeholder: '',
      loading: 'lazy',
      transform: () => ({}),
    },
  )

  const assetUrl = useAssetUrl()
  const src = computed(() => assetUrl(props.image, props.transform))
</script>

<template>
  <img
    v-if="src"
    class="slot"
    :src="src"
    :alt="alt"
    :loading="loading"
    decoding="async"
  />
  <span
    v-else
    class="slot slot-empty"
    role="img"
    :aria-label="alt || placeholder"
  >
    {{ placeholder }}
  </span>
</template>
