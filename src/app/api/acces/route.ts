import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { findActiveMemberBySacredName } from '@/lib/sacred-name'
import { createSessionToken, isSessionSecurityConfigured } from '@/lib/security/session'
import { rateLimit, safeJson, safeText, secureCookieOptions } from '@/lib/security/http'
import { getLecteur, nomLecteur } from '@/lib/acces-lecteur'

const DUREE = 60 * 60 * 12

export async function GET(request: NextRequest) {
  const lecteur = await getLecteur(request)
  return NextResponse.json({
    lecteur: lecteur ? { genre: lecteur.genre, nom: nomLecteur(lecteur) } : null,
  })
}

/** Ouvre une session de lecture, par nom sacré ou par code. */
export async function POST(request: NextRequest) {
  const limite = rateLimit(request, 'acces-lecteur', 10, 15 * 60 * 1000)
  if (limite) return limite

  try {
    if (!isSessionSecurityConfigured()) {
      return NextResponse.json({ error: 'Accès temporairement indisponible' }, { status: 503 })
    }

    const corps = await safeJson<Record<string, unknown>>(request, 2_048)
    const nomSacre = safeText(corps.nomSacre, 120)
    const code = safeText(corps.code, 40)

    if (nomSacre) {
      const membre = await findActiveMemberBySacredName(nomSacre)
      if (!membre) {
        return NextResponse.json({ error: 'Nom sacré inconnu ou membre inactif' }, { status: 404 })
      }
      const reponse = NextResponse.json({ success: true, genre: 'membre' })
      reponse.cookies.set(
        'lecteur-session',
        await createSessionToken('lecteur', `membre:${membre.id}`, DUREE),
        secureCookieOptions(DUREE),
      )
      return reponse
    }

    if (code) {
      const trouve = await db.codeAcces.findFirst({
        where: {
          code: code.toUpperCase(),
          actif: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        select: { id: true, libelle: true },
      })
      if (!trouve) {
        return NextResponse.json({ error: 'Code inconnu, suspendu ou expiré' }, { status: 404 })
      }
      await db.codeAcces.update({
        where: { id: trouve.id },
        data: { utilisations: { increment: 1 }, derniereUtilisation: new Date() },
      })
      const reponse = NextResponse.json({ success: true, genre: 'code', nom: trouve.libelle })
      reponse.cookies.set(
        'lecteur-session',
        await createSessionToken('lecteur', `code:${trouve.id}`, DUREE),
        secureCookieOptions(DUREE),
      )
      return reponse
    }

    return NextResponse.json({ error: 'Indiquez votre nom sacré ou votre code' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}

export async function DELETE() {
  const reponse = NextResponse.json({ success: true })
  reponse.cookies.set('lecteur-session', '', { ...secureCookieOptions(0), maxAge: 0 })
  return reponse
}
