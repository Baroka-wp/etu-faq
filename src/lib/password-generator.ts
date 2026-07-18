const ALPHANUMERIC = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

function securePassword(length: number): string {
  const output: string[] = []
  const max = Math.floor(256 / ALPHANUMERIC.length) * ALPHANUMERIC.length
  while (output.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length * 2))
    for (const byte of bytes) {
      if (byte >= max) continue
      output.push(ALPHANUMERIC[byte % ALPHANUMERIC.length])
      if (output.length === length) break
    }
  }
  return output.join('')
}

export function generatePassword(): string {
  return securePassword(14)
}

export function generateUserPassword(): string {
  return securePassword(16)
}
