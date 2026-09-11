<script setup lang="ts">
  /*
   * Избранное. Отмеченные сердечком туры собираются здесь.
   *
   * Список id пока живёт в браузере (см. useFavorites), поэтому страница
   * ждёт флага ready: до гидратации избранное всегда пустое, и без этого
   * она успевала показать «здесь пусто» человеку, у которого отмечено
   * полтора десятка туров. Когда появится личный кабинет, список приедет
   * оттуда — сама страница про источник не знает и меняться не должна.
   *
   * Порядок обратный тому, в котором отмечали: последнее, что понравилось,
   * лежит сверху — к нему и возвращаются.
   *
   * Класс is-catalog у корня снимает верхний отступ страницы: шапка висит
   * над кадром, и без этого между ними оставалась белая полоса.
   */
  import type { Tour } from '~/types/schema'

  definePageMeta({ layout: 'catalog' })

  const { data } = await useCatalog()
  const { data: site } = await useLanding()
  const { ids, ready, clear } = useFavorites()

  const tours = computed<Tour[]>(() => {
    const byId = new Map(data.value.tours.map((t) => [t.id, t]))
    return [...ids.value]
      .reverse()
      .map((id) => byId.get(id))
      .filter((t): t is Tour => !!t)
  })

  const total = computed(() => tours.value.length)

  /* Пустое избранное — не тупик: под ним лежат ближайшие выезды, чтобы
     было что отметить, не возвращаясь в каталог. */
  const soon = computed(() =>
    nearestFirst(data.value.tours, data.value.departures).slice(0, 4),
  )

  useSeoMeta({
    title: 'Избранное — БогемаТур',
    description: 'Туры и экскурсии, которые вы отметили сердечком.',
    /* Личная подборка, в поиске ей делать нечего */
    robots: 'noindex, nofollow',
  })
</script>

<template>
  <div class="page is-catalog fav-page">
    <section class="chero">
      <MediaSlot
        class="chero-photo"
        :image="site.landing.seo_image ?? '/demo/hero-kbr.webp'"
        alt=""
        loading="eager"
        :transform="{ width: 1920, quality: 70 }"
      />
      <div class="chero-in wrap">
        <h1 class="chero-h1">Избранное</h1>
        <p v-if="ready && total" class="fav-count">
          {{ total }} {{ plural(total, 'тур', 'тура', 'туров') }}
        </p>
      </div>
    </section>

    <div class="wrap">
      <nav class="crumbs">
        <NuxtLink to="/">Главная</NuxtLink>
        <span>Избранное</span>
      </nav>

      <!-- Пока список не прочитан из браузера, не показываем ни сетку, ни
           пустоту: и то и другое было бы враньём. -->
      <div v-if="!ready" class="fav-wait" aria-hidden="true"></div>

      <template v-else-if="total">
        <div class="fav-tools">
          <button type="button" class="fav-clear" @click="clear">
            Очистить список
          </button>
        </div>
        <div class="dgrid catalog-grid">
          <TourCard
            v-for="t in tours"
            :key="t.id"
            :tour="t"
            :departures="data.departures"
          />
        </div>
      </template>

      <template v-else>
        <div class="fav-empty">
          <!-- То же сердце, что на карточках, только крупно и контуром —
               человек должен узнать кнопку, которую ему предлагают нажать. -->
          <svg class="fav-empty-ico" viewBox="0 0 25 25" aria-hidden="true">
            <path
              d="M17.9 3c-2.35 0-4.38 1.41-5.4 3.46C11.48 4.41 9.45 3 7.1 3 3.73 3 1 5.89 1 9.45c0 3.55 2.09 5.64 4.79 8.32C8.49 20.45 12.5 23 12.5 23s3.88-2.51 6.71-5.23C22.23 14.87 24 13.02 24 9.45 24 5.88 21.27 3 17.9 3Z"
            />
          </svg>
          <h2 class="fav-empty-h">В избранном пока пусто</h2>
          <p>
            Нажимайте сердечко на карточке тура — он попадёт сюда, и к нему
            будет удобно вернуться.
          </p>
          <NuxtLink class="btn btn-primary btn-lg" to="/tury"
            >Смотреть все туры</NuxtLink
          >
        </div>

        <!-- Не отправляем человека обратно в каталог за первым сердечком:
             ближайшие выезды лежат здесь же. -->
        <section v-if="soon.length" class="fav-soon">
          <div class="sec-head">
            <h2 class="sec-h2">Ближайшие выезды</h2>
            <div class="sec-tools">
              <NuxtLink class="all-link" to="/tury">Все</NuxtLink>
            </div>
          </div>
          <!-- Четыре в ряд, а не три как в выдаче: это подсказка, а не
               каталог, и второй строкой она бы забрала весь экран. -->
          <div class="dgrid">
            <TourCard
              v-for="t in soon"
              :key="t.id"
              :tour="t"
              :departures="data.departures"
            />
          </div>
        </section>
      </template>
    </div>
  </div>
</template>
