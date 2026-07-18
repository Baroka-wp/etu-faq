import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@/lib/security/http'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request, 'user')
    const userId = session?.sub

    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const user = await (prisma as any).inscription.findUnique({
      where: {
        id: userId
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
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
    })

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
