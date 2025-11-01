import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT - Modifier un livre
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const {
      title,
      slug,
      author,
      description,
      price,
      isFree,
      category,
      imageUrl,
      whatsappMessage
    } = body

    // Validation des champs requis
    if (!title || !slug || !author || !description || !category) {
      return NextResponse.json(
        { error: 'Tous les champs marqués d\'un astérisque sont obligatoires' },
        { status: 400 }
      )
    }

    // Vérifier que le livre existe
    const existingBook = await prisma.book.findUnique({
      where: { id }
    })

    if (!existingBook) {
      return NextResponse.json(
        { error: 'Livre non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le livre
    const book = await prisma.book.update({
      where: { id },
      data: {
        title,
        slug,
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
      message: 'Livre modifié avec succès',
      book
    })

  } catch (error: any) {
    console.error('Erreur lors de la modification du livre:', error)
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la modification du livre' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Supprimer un livre
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Vérifier que le livre existe
    const existingBook = await prisma.book.findUnique({
      where: { id }
    })

    if (!existingBook) {
      return NextResponse.json(
        { error: 'Livre non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer le livre
    await prisma.book.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Livre supprimé avec succès'
    })

  } catch (error: any) {
    console.error('Erreur lors de la suppression du livre:', error)
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression du livre' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
