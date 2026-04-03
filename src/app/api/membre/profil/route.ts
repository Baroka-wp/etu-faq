import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(request: NextRequest) {
  try {
    // Récupérer l'ID du membre depuis le cookie
    const membreId = request.cookies.get('membre-session')?.value

    if (!membreId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier que le membre existe et est actif
    const membreExistant = await (prisma as any).membre.findUnique({
      where: { id: membreId }
    })

    if (!membreExistant) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      )
    }

    if (membreExistant.statut !== 'actif') {
      return NextResponse.json(
        { error: 'Votre compte est suspendu. Veuillez contacter l\'administrateur.' },
        { status: 403 }
      )
    }

    // Récupérer les données du body
    const body = await request.json()

    // Champs autorisés à la mise à jour
    const champsAutorises = [
      'nom',
      'prenoms',
      'nomSacre',
      'profession',
      'email',
      'dateNaissance',
      'heureNaissance',
      'lieuNaissance',
      'lieuResidence',
      'religionPratique',
      'appartientAutreOrdre',
      'precisionOrdre',
      'telephoneWhatsapp',
      'imageUrl'
    ]

    // Construire les données de mise à jour uniquement avec les champs autorisés
    const donneesMiseAJour: Record<string, any> = {}
    for (const champ of champsAutorises) {
      if (body[champ] !== undefined) {
        donneesMiseAJour[champ] = body[champ]
      }
    }

    // Validation basique
    if (donneesMiseAJour.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(donneesMiseAJour.email)) {
        return NextResponse.json(
          { error: 'Format d\'email invalide' },
          { status: 400 }
        )
      }

      // Vérifier que l'email n'est pas déjà utilisé par un autre membre
      const membreAvecEmail = await (prisma as any).membre.findFirst({
        where: {
          email: donneesMiseAJour.email,
          id: { not: membreId }
        }
      })

      if (membreAvecEmail) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé par un autre compte' },
          { status: 400 }
        )
      }
    }

    // Mise à jour du membre
    const membreMisAJour = await (prisma as any).membre.update({
      where: { id: membreId },
      data: donneesMiseAJour,
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

    return NextResponse.json({
      success: true,
      membre: membreMisAJour,
      message: 'Profil mis à jour avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
