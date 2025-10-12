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

    const inscriptions = await (prisma as any).inscription.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(inscriptions)

  } catch (error: any) {
    console.error('Erreur lors de la récupération des inscriptions:', error)
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des inscriptions' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
