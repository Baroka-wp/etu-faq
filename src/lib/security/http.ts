import { NextRequest, NextResponse } from 'next/server'
import { SessionRole, SESSION_COOKIES, verifySessionToken } from './session'

type RateEntry = { count: number; resetAt: number }
const rateStore = new Map<string, RateEntry>()

export function clientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
}

export function rateLimit(
  request: NextRequest,
  bucket: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const now = Date.now()
  const key = `${bucket}:${clientIp(request)}`
  const current = rateStore.get(key)
  const entry = !current || current.resetAt <= now
    ? { count: 1, resetAt: now + windowMs }
    : { count: current.count + 1, resetAt: current.resetAt }
  rateStore.set(key, entry)

  if (rateStore.size > 5000) {
    for (const [storedKey, stored] of rateStore) {
      if (stored.resetAt <= now) rateStore.delete(storedKey)
    }
  }

  if (entry.count <= limit) return null
  return NextResponse.json(
    { error: 'Trop de tentatives. Veuillez réessayer plus tard.' },
    { status: 429, headers: { 'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)) } }
  )
}

export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return request.headers.get('sec-fetch-site') !== 'cross-site'
  try {
    return new URL(origin).origin === request.nextUrl.origin
  } catch {
    return false
  }
}

export async function getSession(request: NextRequest, role: Exclude<SessionRole, 'upload' | 'event'>) {
  return verifySessionToken(request.cookies.get(SESSION_COOKIES[role])?.value, role)
}

export async function requireSession(request: NextRequest, role: Exclude<SessionRole, 'upload' | 'event'>) {
  const session = await getSession(request, role)
  return session ? null : NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
}

export function secureCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge,
    path: '/',
  }
}

export async function safeJson<T = unknown>(request: NextRequest, maxBytes = 32_768): Promise<T> {
  const length = Number(request.headers.get('content-length') || 0)
  if (length > maxBytes) throw new Error('PAYLOAD_TOO_LARGE')
  const text = await request.text()
  if (new TextEncoder().encode(text).length > maxBytes) throw new Error('PAYLOAD_TOO_LARGE')
  return JSON.parse(text) as T
}

export function safeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed && trimmed.length <= maxLength ? trimmed : null
}

export function safeHttpUrl(value: unknown, maxLength = 2_048): string | null {
  const text = safeText(value, maxLength)
  if (!text) return null
  try {
    const url = new URL(text)
    return url.protocol === 'https:' || (process.env.NODE_ENV !== 'production' && url.protocol === 'http:') ? url.toString() : null
  } catch {
    return null
  }
}

export async function constantTimeEqual(left: unknown, right: unknown): Promise<boolean> {
  if (typeof left !== 'string' || typeof right !== 'string') return false
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(left)),
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(right)),
  ])
  const a = new Uint8Array(leftHash)
  const b = new Uint8Array(rightHash)
  let difference = 0
  for (let index = 0; index < a.length; index++) difference |= a[index] ^ b[index]
  return difference === 0
}
