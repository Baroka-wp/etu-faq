import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Vérifier si l'inscription existe
    const inscription = await prisma.inscription.findUnique({
      where: { id }
    })

    if (!inscription) {
      return NextResponse.json(
        { error: 'Inscription non trouvée' },
        { status: 404 }
      )
    }

    // Supprimer l'inscription
    await prisma.inscription.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Inscription supprimée avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { statut } = body

    // Vérifier si l'inscription existe
    const inscription = await prisma.inscription.findUnique({
      where: { id }
    })

    if (!inscription) {
      return NextResponse.json(
        { error: 'Inscription non trouvée' },
        { status: 404 }
      )
    }

    // Mettre à jour le statut
    const updatedInscription = await prisma.inscription.update({
      where: { id },
      data: { statut }
    })

    return NextResponse.json(updatedInscription, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}