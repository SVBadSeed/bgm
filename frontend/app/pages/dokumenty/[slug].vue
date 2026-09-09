<script setup lang="ts">
  /*
   * Юридическая страница: оферта, политика, соглашение. Одна разметка на все
   * документы — они отличаются только текстом, а вести под каждый свой
   * шаблон значит однажды поправить оформление в одном месте и забыть про
   * остальные.
   *
   * Соседние документы перечислены внизу: человек, дочитавший оферту, чаще
   * всего идёт смотреть политику, и возвращаться за ней в футер незачем.
   */
  definePageMeta({ layout: 'page' })

  const route = useRoute()
  const slug = computed(() => String(route.params.slug))

  const { data } = await useDocuments()

  const doc = computed(() => data.value.items.find((d) => d.slug === slug.value))

  if (!doc.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Документ не найден',
      fatal: true,
    })
  }

  const others = computed(() =>
    data.value.items.filter((d) => d.slug !== slug.value),
  )

  useSeoMeta({
    title: () => `${doc.value?.title ?? 'Документ'} — БогемаТур`,
    description: () =>
      `${doc.value?.title}: официальный документ ООО «АТТ», туроператора БогемаТур.`,
    /* Юридические страницы не должны конкурировать в поиске с турами */
    robots: 'noindex, follow',
  })
</script>

<template>
  <div v-if="doc" class="page legal-page">
    <div class="wrap">
      <nav class="crumbs">
        <NuxtLink to="/">Главная</NuxtLink>
        <span>{{ doc.title }}</span>
      </nav>

      <header class="legal-head">
        <h1 class="page-h1">{{ doc.title }}</h1>
        <p v-if="doc.note" class="legal-note">{{ doc.note }}</p>
      </header>

      <!-- Текст приходит из админки разметкой: набирают его юристы, и
           переводить их правки в компоненты каждый раз никто не будет. -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <article class="legal-body" v-html="doc.body"></article>

      <div v-if="others.length" class="legal-more">
        <h2>Другие документы</h2>
        <div class="legal-links">
          <NuxtLink
            v-for="o in others"
            :key="o.id"
            :to="`/dokumenty/${o.slug}`"
            class="legal-link"
          >
            {{ o.title }}
            <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true">
              <path
                d="M0 5h16m0 0l-4-4m4 4l-4 4"
                fill="none"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
