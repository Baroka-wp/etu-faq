import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const adminSession = request.cookies.get('admin-session')?.value
    if (adminSession !== 'authenticated') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer les statistiques
    const totalInscriptions = await (prisma as any).inscription.count()
    const totalMembers = await (prisma as any).inscription.count({
      where: {
        statut: 'Actif'
      }
    })
    const pendingApprovals = await (prisma as any).inscription.count({
      where: {
        statut: 'En attente'
      }
    })

    // Récupérer les inscriptions récentes
    const recentInscriptions = await (prisma as any).inscription.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        telephone: true,
        statut: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      totalInscriptions,
      totalMembers,
      pendingApprovals,
      recentInscriptions
    })

  } catch (error: any) {
    console.error('Erreur lors de la récupération des données du dashboard:', error)
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des données' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
