import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthorizedAdmin } from '@/lib/security/admin'
import { revealCredential } from '@/lib/security/credential'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const adminSession = await getAuthorizedAdmin(request)
    if (!adminSession) {
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

    return NextResponse.json(await Promise.all(inscriptions.map(async (inscription: { motDePasse: string }) => ({
      ...inscription,
      motDePasse: await revealCredential(inscription.motDePasse),
    }))))

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
