import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@/lib/security/http'
import { computeParticipation, traverseeConcerneMembre } from '@/lib/participation'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const membreId = (await getSession(request, 'membre'))?.sub

    if (!membreId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer le membre
    const membre = await (prisma as any).membre.findUnique({
      where: { id: membreId },
      select: { id: true, grade: true, createdAt: true }
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
    const traverseesAutorisees = traverseesAVenir.filter((t: any) =>
      traverseeConcerneMembre(t.gradesAutorises, membre.grade)
    )

    const prochainEvents = traverseesAutorisees.length

    // Inscriptions du membre et traversées passées pour le taux de participation
    const [inscriptions, traverseesPassees, comptagesInscrits] = await Promise.all([
      (prisma as any).inscriptionTraversee.findMany({
        where: { membreId: membre.id },
        select: { traverseeId: true }
      }),
      (prisma as any).traversee.findMany({
        where: { date: { lt: new Date() } },
        select: { id: true, date: true, gradesAutorises: true }
      }),
      (prisma as any).inscriptionTraversee.groupBy({
        by: ['traverseeId'],
        _count: { _all: true }
      })
    ])

    const totalInscriptions = inscriptions.length

    const inscritsParTraversee = new Map<string, number>(
      comptagesInscrits.map((c: any) => [c.traverseeId, c._count._all])
    )

    const participation = computeParticipation(
      traverseesPassees,
      membre,
      new Set(inscriptions.map((i: any) => i.traverseeId)),
      inscritsParTraversee
    )

    // Compter le nombre total de livres
    const totalLivres = await (prisma as any).book.count()

    return NextResponse.json({
      success: true,
      stats: {
        prochainEvents,
        totalInscriptions,
        totalLivres,
        participation
      }
    })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
