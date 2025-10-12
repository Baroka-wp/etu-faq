import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { duration = 24 } = await request.json() // Durée en heures

    // Vérifier si l'inscription existe
    const inscription = await prisma.inscription.findUnique({
      where: { id }
    })

    if (!inscription) {
      return NextResponse.json(
        { error: 'Inscription non trouvée' },
        { status: 404 }
      )
    }

    // Désactiver tous les anciens liens pour cette inscription
    await prisma.uniqueLink.updateMany({
      where: { 
        inscriptionId: id,
        isActive: true 
      },
      data: { isActive: false }
    })

    // Générer un nouveau token
    const token = crypto.randomBytes(32).toString('hex')
    
    // Calculer la nouvelle date d'expiration
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + duration)

    // Déterminer le chemin du PDF basé sur le grade
    const gradeToPdfMap: Record<string, string> = {
      'EXPLORATEUR': 'cours_explorateur_yod.pdf',
      'NÉOPHYTE': 'cours_explorateur_yod.pdf',
      'CONSTRUCTEUR': 'cours_explorateur_yod.pdf',
      'NAVIGATEUR': 'cours_explorateur_yod.pdf',
      'ALCHIMISTE': 'cours_explorateur_yod.pdf'
    }

    const pdfPath = gradeToPdfMap[inscription.grade] || 'cours_explorateur_yod.pdf'

    // Créer le nouveau lien unique
    const uniqueLink = await prisma.uniqueLink.create({
      data: {
        inscriptionId: id,
        token,
        pdfPath,
        expiresAt,
        isActive: true
      }
    })

    // Générer l'URL complète
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const downloadUrl = `${baseUrl}/download/${token}`

    return NextResponse.json({
      success: true,
      link: uniqueLink,
      downloadUrl,
      expiresAt: uniqueLink.expiresAt
    }, { status: 200 })

  } catch (error) {
    console.error('Erreur lors de la réactivation du lien:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
