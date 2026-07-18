import { NextRequest, NextResponse } from 'next/server'
import { constantTimeEqual, rateLimit, safeJson, secureCookieOptions } from '@/lib/security/http'
import { createSessionToken, isSessionSecurityConfigured } from '@/lib/security/session'
import { db } from '@/lib/db'

const ADMIN_MAX_AGE = 60 * 60 * 8

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'admin-login', 5, 15 * 60 * 1000)
  if (limited) return limited

  try {
    const existingAdmins = await db.membre.count({ where: { role: 'ADMIN', statut: 'actif' } })
    if (existingAdmins > 0) {
      return NextResponse.json(
        { error: 'Connectez-vous avec votre nom sacré depuis l’espace membre.' },
        { status: 410 }
      )
    }
    const { password } = await safeJson<{ password?: unknown }>(request, 2_048)
    const adminPassword = process.env.ADMIN_PASSWORD
    const minimumLength = process.env.NODE_ENV === 'production' ? 12 : 1
    if (!adminPassword || adminPassword.length < minimumLength || !isSessionSecurityConfigured()) {
      console.error('Configuration de sécurité incomplète: ADMIN_PASSWORD (12+) et SESSION_SECRET (32+) sont requis')
      return NextResponse.json({ error: 'Authentification temporairement indisponible' }, { status: 503 })
    }

    if (!(await constantTimeEqual(password, adminPassword))) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-session', await createSessionToken('admin', 'admin', ADMIN_MAX_AGE), secureCookieOptions(ADMIN_MAX_AGE))
    return response
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}
