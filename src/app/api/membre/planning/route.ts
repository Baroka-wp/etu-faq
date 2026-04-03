import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function gradeAutorise(membreGrade: string, gradesAutorises: string[]): boolean {
  // Alchimistes peuvent accéder à tous les événements
  if (membreGrade === 'Alchimiste') return true
  // Si aucun grade spécifique, événement ouvert à tous
  if (gradesAutorises.length === 0) return true
  // Vérifier si le grade du membre est autorisé
  return gradesAutorises.includes(membreGrade)
}

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

    // Récupérer toutes les traversées à venir
    const traversees = await (prisma as any).traversee.findMany({
      where: {
        date: {
          gte: new Date()
        }
      },
      include: {
        _count: {
          select: { inscriptions: true }
        },
        inscriptions: {
          where: { membreId: membre.id },
          select: { id: true }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Filtrer selon le grade et marquer les inscriptions
    const traverseesAutorisees = traversees
      .filter((t: any) => gradeAutorise(membre.grade, t.gradesAutorises))
      .map((t: any) => ({
        ...t,
        isInscrit: t.inscriptions.length > 0,
        inscriptions: undefined // Retirer les inscriptions détaillées
      }))

    return NextResponse.json({
      success: true,
      traversees: traverseesAutorisees
    })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
