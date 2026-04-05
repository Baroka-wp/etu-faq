import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Singleton Prisma - réutilisé entre les requêtes
const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function POST(request: NextRequest) {
  try {
    const membreId = request.cookies.get('membre-session')?.value

    if (!membreId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { traverseeId } = await request.json()

    if (!traverseeId) {
      return NextResponse.json({ error: 'ID de traversée requis' }, { status: 400 })
    }

    // Vérifier que le membre existe
    const membre = await (prisma as any).membre.findUnique({
      where: { id: membreId },
      select: { id: true, grade: true }
    })

    if (!membre) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    // Vérifier que la traversée existe
    const traversee = await (prisma as any).traversee.findUnique({
      where: { id: traverseeId }
    })

    if (!traversee) {
      return NextResponse.json({ error: 'Traversée non trouvée' }, { status: 404 })
    }

    // Vérifier que le grade est autorisé
    const isAlchimiste = membre.grade === 'Alchimiste'
    const isGradeAutorise = traversee.gradesAutorises.length === 0 || traversee.gradesAutorises.includes(membre.grade)

    if (!isAlchimiste && !isGradeAutorise) {
      return NextResponse.json({
        error: 'Votre grade n\'est pas autorisé pour cet événement'
      }, { status: 403 })
    }

    // Vérifier si déjà inscrit
    const existingInscription = await (prisma as any).inscriptionTraversee.findUnique({
      where: {
        traverseeId_membreId: {
          traverseeId,
          membreId: membre.id
        }
      }
    })

    if (existingInscription) {
      return NextResponse.json({
        error: 'Vous êtes déjà inscrit à cet événement'
      }, { status: 400 })
    }

    // Créer l'inscription
    await (prisma as any).inscriptionTraversee.create({
      data: {
        traverseeId,
        membreId: membre.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Inscription réussie'
    })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
