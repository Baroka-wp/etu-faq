import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const membreId = request.cookies.get('membre-session')?.value

    if (!membreId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer le membre
    const membre = await (prisma as any).membre.findUnique({
      where: { id: membreId },
      select: { id: true, grade: true }
    })

    if (!membre) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    // Compter les traversées à venir accessibles selon le grade
    const traverseesAVenir = await (prisma as any).traversee.findMany({
      where: {
        date: {
          gte: new Date()
        }
      }
    })

    // Filtrer selon le grade
    const traverseesAutorisees = traverseesAVenir.filter((t: any) => {
      if (membre.grade === 'Alchimiste') return true
      if (t.gradesAutorises.length === 0) return true
      return t.gradesAutorises.includes(membre.grade)
    })

    const prochainEvents = traverseesAutorisees.length

    // Compter le nombre total d'inscriptions du membre
    const totalInscriptions = await (prisma as any).inscriptionTraversee.count({
      where: { membreId: membre.id }
    })

    // Compter le nombre total de livres
    const totalLivres = await (prisma as any).book.count()

    return NextResponse.json({
      success: true,
      stats: {
        prochainEvents,
        totalInscriptions,
        totalLivres
      }
    })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
