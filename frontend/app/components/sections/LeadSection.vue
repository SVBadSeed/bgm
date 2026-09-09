<script setup lang="ts">
  /*
   * Завершение страницы: заявка на подбор тура. Слева обращение и контакты,
   * справа белая карточка с формой — та же система, что у промо и полки.
   */
  import type { SiteSettings } from '~/types/schema'

  const props = withDefaults(
    defineProps<{
      id: string
      title: string | null
      subtitle: string | null
      note: string | null
      successText: string | null
      settings: SiteSettings
      policyUrl?: string
    }>(),
    { policyUrl: '#' },
  )

  const message = ref('')

  /* Со страницы тура сюда приезжает готовая строка «Тур: …, выезд …»: человек
     нажал «Забронировать», и переписывать это руками ему незачем. Поле
     остаётся обычным — написанное можно дополнить или стереть. */
  const preset = useState<string>('lead-preset', () => '')
  watch(
    preset,
    (v) => {
      if (v) message.value = v
    },
    { immediate: true },
  )
  const name = ref('')
  const phone = ref('')
  const email = ref('')
  const busy = ref(false)
  const done = ref(false)
  const error = ref('')
  const shake = ref(false)

  async function submit() {
    error.value = ''
    busy.value = true
    try {
      await $fetch('/api/lead', {
        method: 'POST',
        body: {
          name: name.value,
          phone: phone.value,
          email: email.value,
          message: message.value,
          source: 'Форма на главной',
        },
      })
      done.value = true
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } }
      error.value =
        err?.data?.message ?? 'Не получилось отправить. Попробуйте ещё раз.'
      /* Класс снимаем, чтобы следующая ошибка снова проиграла анимацию */
      shake.value = true
      setTimeout(() => (shake.value = false), 420)
    } finally {
      busy.value = false
    }
  }

  const mailHref = computed(() =>
    props.settings.email ? `mailto:${props.settings.email}` : null,
  )
</script>

<template>
  <section :id="id" class="sec lead-sec">
    <div class="wrap">
      <div v-reveal class="lead">
        <div class="lead-say">
          <h2 class="lead-h2">{{ title }}</h2>
          <p v-if="subtitle" class="lead-sub">{{ subtitle }}</p>
          <div class="lead-contacts">
            <a
              v-if="settings.phone"
              class="lead-tel"
              :href="settings.phone_href ?? `tel:${settings.phone}`"
              >{{ settings.phone }}</a
            >
            <a v-if="mailHref" class="lead-mail" :href="mailHref">{{
              settings.email
            }}</a>
            <p v-if="settings.address" class="lead-addr">
              {{ settings.address }}
            </p>
          </div>
        </div>

        <div class="lead-card">
          <p v-if="done" class="lead-ok">{{ successText }}</p>
          <form
            v-else
            class="lead-form"
            :class="{ 'is-busy': busy, 'is-error': shake }"
            @submit.prevent="submit"
          >
            <label class="lead-field">
              <span>Опишите ваш вопрос</span>
              <textarea
                v-model="message"
                rows="3"
                placeholder="Куда хотите поехать, даты и сколько человек"
              ></textarea>
            </label>

            <div class="lead-row">
              <label class="lead-field">
                <span>Имя</span>
                <input
                  v-model="name"
                  type="text"
                  placeholder="Введите ваше имя"
                  autocomplete="name"
                />
              </label>
              <label class="lead-field">
                <span>Телефон</span>
                <input
                  v-model="phone"
                  type="tel"
                  inputmode="tel"
                  placeholder="Введите ваш телефон"
                  required
                  autocomplete="tel"
                />
              </label>
            </div>

            <label class="lead-field">
              <span>Электронная почта</span>
              <input
                v-model="email"
                type="email"
                placeholder="Введите ваш email"
                autocomplete="email"
              />
            </label>

            <button class="btn lead-send" type="submit" :disabled="busy">
              <span v-if="busy" class="spinner"></span>
              {{ busy ? 'Отправляем' : 'Оставить заявку' }}
            </button>
            <p v-if="error" class="lead-err">{{ error }}</p>
            <p v-if="note" class="lead-note">
              {{ note }}
              <a :href="policyUrl">политику защиты персональных данных</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
