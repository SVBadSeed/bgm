/* Общий клиент для seed-скриптов: читает ../../.env, логинится админом. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createDirectus, rest, authentication } from '@directus/sdk'

const here = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(here, '..', '..')

function loadEnv() {
  const out = {}
  for (const name of ['.env', '.env.example']) {
    const file = path.join(ROOT, name)
    if (!fs.existsSync(file)) continue
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (m && !(m[1] in out)) out[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
  return { ...out, ...process.env }
}

export const env = loadEnv()
export const DIRECTUS_URL =
  env.DIRECTUS_URL || `http://localhost:${env.DIRECTUS_PORT || 8055}`

export async function adminClient() {
  const client = createDirectus(DIRECTUS_URL)
    .with(rest())
    .with(authentication('json', { autoRefresh: false }))
  const email = env.DIRECTUS_ADMIN_EMAIL
  const password = env.DIRECTUS_ADMIN_PASSWORD
  if (!email || !password)
    throw new Error('DIRECTUS_ADMIN_EMAIL / DIRECTUS_ADMIN_PASSWORD не заданы')
  await client.login({ email, password })
  return client
}

export async function waitForDirectus(tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(`${DIRECTUS_URL}/server/ping`)
      if (r.ok) return
    } catch {
      /* ещё поднимается */
    }
    await new Promise((r) => setTimeout(r, 2000))
  }
  throw new Error(`Directus не ответил на ${DIRECTUS_URL}/server/ping`)
}

export const log = (...a) => console.log('[seed]', ...a)
