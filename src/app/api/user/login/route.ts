import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createSessionToken } from '@/lib/security/session'
import { rateLimit, safeJson, secureCookieOptions } from '@/lib/security/http'
import { protectCredential } from '@/lib/security/credential'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'user-login', 8, 15 * 60 * 1000)
  if (limited) return limited
  try {
    const { password, videotheque } = await safeJson<{ password?: unknown; videotheque?: boolean }>(request, 2_048)
    if (typeof password !== 'string' || password.length !== 4) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 400 })
    }

    // Rechercher l'utilisateur par mot de passe
    const protectedPassword = await protectCredential(password)
    const user = await prisma.inscription.findUnique({ where: { codeAspirant: protectedPassword } })
    if (user &&
        user.codeExpireLe && user.codeExpireLe.getTime() > Date.now() &&
        (!videotheque || user.statut === 'Actif')) {
      // Créer un cookie de session utilisateur
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          sexe: user.sexe,
          dateNaissance: user.dateNaissance,
          heureNaissance: user.heureNaissance,
          lieuNaissance: user.lieuNaissance,
          lieuResidence: user.lieuResidence,
          religion: user.religion,
          telephone: user.telephone,
          grade: user.grade,
          programme: user.programme,
          statut: user.statut,
          createdAt: user.createdAt
        }
      })
      
      const maxAge = Math.min(60 * 60 * 24 * 7, Math.floor((user.codeExpireLe.getTime() - Date.now()) / 1000))
      response.cookies.set('user-session', await createSessionToken('user', user.id, maxAge, user.codeExpireLe.getTime()), secureCookieOptions(maxAge))

      return response
    } else {
      return NextResponse.json(
        { error: videotheque ? 'Accès refusé. Vérifiez votre code et que votre dossier est actif.' : 'Code incorrect ou expiré.' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Erreur lors de la connexion utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
