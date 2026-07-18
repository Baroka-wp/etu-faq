import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createSessionToken } from '@/lib/security/session'
import { rateLimit, safeJson, secureCookieOptions } from '@/lib/security/http'
import { isProtectedCredential, protectCredential } from '@/lib/security/credential'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'user-login', 8, 15 * 60 * 1000)
  if (limited) return limited
  try {
    const { password } = await safeJson<{ password?: unknown }>(request, 2_048)
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 400 })
    }

    // Rechercher l'utilisateur par mot de passe
    const protectedPassword = await protectCredential(password)
    const user = await (prisma as any).inscription.findFirst({
      where: {
        motDePasse: { in: [password, protectedPassword] }
      }
    })

    if (user) {
      if (!isProtectedCredential(user.motDePasse)) {
        await (prisma as any).inscription.update({ where: { id: user.id }, data: { motDePasse: protectedPassword } })
      }
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
      
      const maxAge = 60 * 60 * 24 * 7
      response.cookies.set('user-session', await createSessionToken('user', user.id, maxAge), secureCookieOptions(maxAge))

      return response
    } else {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
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
