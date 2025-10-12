import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Rechercher l'utilisateur par mot de passe
    const user = await (prisma as any).inscription.findFirst({
      where: {
        motDePasse: password
      }
    })

    if (user) {
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
      
      response.cookies.set('user-session', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30 // 30 jours
      })

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
