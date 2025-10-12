import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('Génération de lien pour l\'inscription:', id)
    
    let duration = 24
    try {
      const body = await request.json()
      duration = body.duration || 24
    } catch (e) {
      console.log('Utilisation de la durée par défaut (24h)')
    }

    // Vérifier si l'inscription existe
    console.log('Recherche de l\'inscription avec l\'ID:', id)
    const inscription = await prisma.inscription.findUnique({
      where: { id }
    })

    if (!inscription) {
      console.log('Inscription non trouvée pour l\'ID:', id)
      return NextResponse.json(
        { error: 'Inscription non trouvée' },
        { status: 404 }
      )
    }
    
    console.log('Inscription trouvée:', inscription.prenom, inscription.nom, inscription.grade)

    // Générer un token unique
    const token = crypto.randomBytes(32).toString('hex')
    
    // Calculer la date d'expiration
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + duration)

    // Déterminer le chemin du PDF basé sur le grade
    const gradeToPdfMap: Record<string, string> = {
      'NÉOPHYTE': 'cours-néophyte.pdf',
      'CONSTRUCTEUR': 'cours-constructeur.pdf',
      'NAVIGATEUR': 'cours-navigateur.pdf',
      'ALCHIMISTE': 'cours-alchimiste.pdf',
      'EXPLORATEUR': 'cours-explorateur.pdf'
    }

    const pdfPath = gradeToPdfMap[inscription.grade] || 'cours-néophyte.pdf'

    // Désactiver les anciens liens pour cette inscription
    await prisma.uniqueLink.updateMany({
      where: { 
        inscriptionId: id,
        isActive: true 
      },
      data: { isActive: false }
    })

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
    console.error('Détails de l\'erreur:', {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
