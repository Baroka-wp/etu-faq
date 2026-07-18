import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@/lib/security/http'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'ID du membre depuis le cookie
    const membreId = (await getSession(request, 'membre'))?.sub

    if (!membreId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer les informations du membre
    const membre = await (prisma as any).membre.findUnique({
      where: { id: membreId },
      select: {
        id: true,
        nom: true,
        prenoms: true,
        nomSacre: true,
        profession: true,
        email: true,
        dateNaissance: true,
        heureNaissance: true,
        lieuNaissance: true,
        lieuResidence: true,
        religionPratique: true,
        appartientAutreOrdre: true,
        precisionOrdre: true,
        grade: true,
        equipage: true,
        telephoneWhatsapp: true,
        statut: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!membre) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      )
    }

    if (membre.statut !== 'actif') {
      return NextResponse.json(
        { error: 'Votre compte est suspendu. Veuillez contacter l\'administrateur.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      membre
    })

  } catch (error) {
    console.error('Erreur lors de la récupération du membre:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
