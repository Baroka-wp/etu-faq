import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { getAuthorizedAdmin } from '@/lib/security/admin'

const prisma = new PrismaClient()

// Vérifier que Prisma est correctement configuré

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification admin
    const adminSession = await getAuthorizedAdmin(request)
    if (!adminSession) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params
    
    let duration = 24
    try {
      const body = await request.json()
      const requestedDuration = Number(body.duration)
      duration = Number.isInteger(requestedDuration) && requestedDuration >= 1 && requestedDuration <= 168 ? requestedDuration : 24
    } catch (e) {
      console.log('Utilisation de la durée par défaut (24h)')
    }

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
    

    // Générer un token unique
    const token = crypto.randomBytes(32).toString('hex')
    
    // Calculer la date d'expiration
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

    // Désactiver les anciens liens pour cette inscription
    try {
      await prisma.uniqueLink.updateMany({
        where: { 
          inscriptionId: id,
          isActive: true 
        },
        data: { isActive: false }
      })
    } catch (updateError) {
      console.error('Impossible de désactiver les anciens liens:', updateError)
      // Continuer même si la désactivation échoue
    }

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
    console.error('Erreur lors de la génération du lien:', error)
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur'
      },
      { status: 500 }
    )
  }
}
