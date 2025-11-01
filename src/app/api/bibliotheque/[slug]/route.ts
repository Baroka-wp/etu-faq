import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Récupérer un livre par son slug (API publique)
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const book = await prisma.book.findUnique({
      where: {
        slug: slug
      }
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Livre non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ book })
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du livre' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
