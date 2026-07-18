const encoder = new TextEncoder()

export type SessionRole = 'admin' | 'membre' | 'user' | 'registration' | 'upload' | 'event'

export type SessionPayload = {
  sub: string
  role: SessionRole
  iat: number
  exp: number
  nonce: string
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET
  if (secret && secret.length >= 32) return secret
  if (process.env.NODE_ENV !== 'production') return `${secret || 'local'}:development-only-session-key-that-is-not-used-in-production`
  return null
}

async function signingKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export function isSessionSecurityConfigured(): boolean {
  return getSessionSecret() !== null
}

export async function createSessionToken(
  role: SessionRole,
  subject: string,
  maxAgeSeconds: number
): Promise<string> {
  const secret = getSessionSecret()
  if (!secret) throw new Error('SESSION_SECRET doit contenir au moins 32 caractères')

  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    sub: subject,
    role,
    iat: now,
    exp: now + maxAgeSeconds,
    nonce: crypto.randomUUID(),
  }
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)))
  const signature = await crypto.subtle.sign('HMAC', await signingKey(secret), encoder.encode(encodedPayload))
  return `${encodedPayload}.${base64UrlEncode(new Uint8Array(signature))}`
}

export async function verifySessionToken(
  token: string | undefined,
  expectedRole?: SessionRole
): Promise<SessionPayload | null> {
  const secret = getSessionSecret()
  if (!secret || !token) return null

  try {
    const [encodedPayload, encodedSignature, extra] = token.split('.')
    if (!encodedPayload || !encodedSignature || extra) return null
    const valid = await crypto.subtle.verify(
      'HMAC',
      await signingKey(secret),
      base64UrlDecode(encodedSignature) as BufferSource,
      encoder.encode(encodedPayload)
    )
    if (!valid) return null

    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedPayload))) as SessionPayload
    const now = Math.floor(Date.now() / 1000)
    if (!payload.sub || !payload.role || !payload.exp || payload.exp <= now || payload.iat > now + 60) return null
    if (expectedRole && payload.role !== expectedRole) return null
    return payload
  } catch {
    return null
  }
}

export const SESSION_COOKIES: Record<Exclude<SessionRole, 'upload' | 'event'>, string> = {
  admin: 'admin-session',
  membre: 'membre-session',
  user: 'user-session',
  registration: 'registration-session',
}
