import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Singleton Prisma - réutilisé entre les requêtes
const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

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

    // Requête parallèle pour optimiser
    const [membre, traversees] = await Promise.all([
      (prisma as any).membre.findUnique({
        where: { id: membreId },
        select: { id: true, grade: true }
      }),
      (prisma as any).traversee.findMany({
        where: {
          date: {
            gte: new Date()
          }
        },
        include: {
          inscriptions: {
            where: { membreId },
            select: { id: true }
          }
        },
        orderBy: {
          date: 'asc'
        }
      })
    ])

    if (!membre) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    // Filtrer selon le grade et marquer les inscriptions
    const traverseesAutorisees = traversees
      .filter((t: any) => gradeAutorise(membre.grade, t.gradesAutorises))
      .map((t: any) => ({
        id: t.id,
        type: t.type,
        titre: t.titre,
        description: t.description,
        date: t.date,
        lieu: t.lieu,
        gradesAutorises: t.gradesAutorises,
        isInscrit: t.inscriptions.length > 0
      }))

    return NextResponse.json({
      success: true,
      traversees: traverseesAutorisees
    })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
