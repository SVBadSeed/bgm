interface LeadBody {
  name?: string
  phone?: string
  email?: string
  message?: string
  source?: string
}

export default defineEventHandler(async (event) => {
  const body = (await readBody<LeadBody>(event)) ?? {}
  const name = (body.name ?? '').trim().slice(0, 200)
  const phone = (body.phone ?? '').trim().slice(0, 40)
  const email = (body.email ?? '').trim().toLowerCase().slice(0, 200)
  const message = (body.message ?? '').trim().slice(0, 4000)

  if (!phone && !email) {
    throw createError({
      statusCode: 400,
      message: 'Оставьте телефон или почту.',
    })
  }
  if (email && !EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, message: 'Проверьте адрес почты.' })
  }

  await directusCreate('leads', {
    name,
    phone,
    email,
    message,
    source: (body.source ?? 'landing').slice(0, 60),
  })
  return { ok: true }
})
