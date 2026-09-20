import { NextRequest, NextResponse } from 'next/server'
import { constantTimeEqual, rateLimit, safeJson, secureCookieOptions } from '@/lib/security/http'
import { createSessionToken, isSessionSecurityConfigured } from '@/lib/security/session'

const REGISTRATION_MAX_AGE = 60 * 60
const MEMBER_ACCESS_MIN_LENGTH = 5

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'registration-access', 6, 15 * 60 * 1000)
  if (limited) return limited

  try {
    const { password } = await safeJson<{ password?: unknown }>(request, 2_048)
    // Le nom non public est prioritaire. L'ancien nom reste accepté côté serveur le temps de migrer l'environnement.
    const accessPassword = process.env.MEMBER_ACCESS_PASSWORD
      || (process.env.NODE_ENV !== 'production' ? process.env.NEXT_PUBLIC_MEMBER_ACCESS_PASSWORD : undefined)
    if (
      !accessPassword
      || accessPassword.length < MEMBER_ACCESS_MIN_LENGTH
      || !isSessionSecurityConfigured()
    ) {
      return NextResponse.json({ error: 'Accès temporairement indisponible' }, { status: 503 })
    }
    if (!(await constantTimeEqual(password, accessPassword))) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(
      'registration-session',
      await createSessionToken('registration', 'registration-form', REGISTRATION_MAX_AGE),
      secureCookieOptions(REGISTRATION_MAX_AGE)
    )
    return response
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}
