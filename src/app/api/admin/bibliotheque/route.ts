import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Récupérer tous les livres
export async function GET() {
  try {
    const books = await prisma.book.findMany({
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

// POST - Créer un nouveau livre
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      title,
      author,
      description,
      price,
      isFree,
      category,
      imageUrl,
      whatsappMessage
    } = body

    // Validation des champs requis
    if (!title || !author || !description || !category) {
      return NextResponse.json(
        { error: 'Tous les champs marqués d\'un astérisque sont obligatoires' },
        { status: 400 }
      )
    }

    // Créer le livre
    const book = await prisma.book.create({
      data: {
        title,
        author,
        description,
        price: isFree ? null : price,
        isFree,
        category,
        imageUrl: imageUrl || '',
        whatsappMessage: whatsappMessage || ''
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Livre créé avec succès',
      book
    })

  } catch (error: any) {
    console.error('Erreur lors de la création du livre:', error)
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du livre' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
