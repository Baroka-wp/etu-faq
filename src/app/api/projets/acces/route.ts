import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { findActiveMemberBySacredName } from '@/lib/sacred-name'
import { createSessionToken, isSessionSecurityConfigured } from '@/lib/security/session'
import { rateLimit, safeJson, safeText, secureCookieOptions } from '@/lib/security/http'

const COMITE_MAX_AGE = 60 * 60 * 12

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'comite-acces', 8, 15 * 60 * 1000)
  if (limited) return limited

  try {
    if (!isSessionSecurityConfigured()) {
      return NextResponse.json({ error: 'Accès temporairement indisponible' }, { status: 503 })
    }

    const body = await safeJson<{ nomSacre?: unknown }>(request, 2_048)
    const nomSacre = safeText(body.nomSacre, 120)
    if (!nomSacre) {
      return NextResponse.json({ error: 'Le nom sacré est requis' }, { status: 400 })
    }

    const match = await findActiveMemberBySacredName(nomSacre)
    const membre = match
      ? await db.membre.findFirst({
          where: {
            id: match.id,
            statut: 'actif',
            OR: [{ comiteProjets: true }, { role: 'ADMIN' }],
          },
          select: { id: true, nom: true, prenoms: true, nomSacre: true, role: true },
        })
      : null

    if (!membre) {
      return NextResponse.json(
        { error: "Ce nom sacré n'ouvre pas l'espace de suivi des projets." },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      membre: {
        id: membre.id,
        nomSacre: membre.nomSacre?.trim() ?? null,
        nom: membre.nom,
        prenoms: membre.prenoms,
        isAdmin: membre.role === 'ADMIN',
      },
    })
    response.cookies.set(
      'comite-session',
      await createSessionToken('comite', membre.id, COMITE_MAX_AGE),
      secureCookieOptions(COMITE_MAX_AGE)
    )
    return response
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}
