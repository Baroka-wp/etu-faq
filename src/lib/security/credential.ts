const encoder = new TextEncoder()
const decoder = new TextDecoder()
const PREFIX = 'enc.v1'

function secret(): string {
  const value = process.env.CREDENTIAL_SECRET || process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET
  if (value && value.length >= 32) return value
  if (process.env.NODE_ENV !== 'production' && value) return `${value}:development-only-credential-key`
  throw new Error('CREDENTIAL_SECRET doit contenir au moins 32 caractères')
}

function encode(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url')
}

function decode(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, 'base64url'))
}

async function key() {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(secret()))
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

async function deterministicIv(credential: string): Promise<Uint8Array> {
  const hmacKey = await crypto.subtle.importKey(
    'raw', encoder.encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', hmacKey, encoder.encode(`credential:${credential}`))
  return new Uint8Array(signature).slice(0, 12)
}

export function isProtectedCredential(value: string): boolean {
  return value.startsWith(`${PREFIX}.`)
}

export async function protectCredential(credential: string): Promise<string> {
  const iv = await deterministicIv(credential)
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource, additionalData: encoder.encode(PREFIX) },
    await key(),
    encoder.encode(credential)
  )
  return `${PREFIX}.${encode(iv)}.${encode(new Uint8Array(ciphertext))}`
}

export async function revealCredential(value: string): Promise<string> {
  if (!isProtectedCredential(value)) return value
  const [, version, ivValue, ciphertextValue] = value.split('.')
  if (`enc.${version}` !== PREFIX || !ivValue || !ciphertextValue) throw new Error('Identifiant chiffré invalide')
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: decode(ivValue) as BufferSource, additionalData: encoder.encode(PREFIX) },
    await key(),
    decode(ciphertextValue) as BufferSource
  )
  return decoder.decode(plaintext)
}
