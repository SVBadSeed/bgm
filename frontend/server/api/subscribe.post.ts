export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string }>(event)
  const email = (body?.email ?? '').trim().toLowerCase()

  if (!EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, message: 'Проверьте адрес почты.' })
  }

  await directusCreate('subscribers', { email, source: 'landing' })
  return { ok: true }
})
