import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Récupérer tous les livres (API publique)
export async function GET() {
  try {
    const books = await prisma.book.findMany({
      where: {
        // On peut ajouter des conditions ici si nécessaire
        // Par exemple, ne montrer que les livres actifs
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ books })
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des livres' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
