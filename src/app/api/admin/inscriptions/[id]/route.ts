import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Vérifier l'authentification admin
    const adminSession = request.cookies.get('admin-session')?.value
    if (adminSession !== 'authenticated') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer l'inscription avec tous ses détails
    const inscription = await prisma.inscription.findUnique({
      where: { id }
    })

    if (!inscription) {
      return NextResponse.json(
        { error: 'Inscription non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(inscription, { status: 200 })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'inscription:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nom, prenom, sexe, telephone, lieuResidence, grade, programme, statut } = body

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

    // Mettre à jour l'inscription complète
    const updatedInscription = await prisma.inscription.update({
      where: { id },
      data: {
        nom,
        prenom,
        sexe,
        telephone,
        lieuResidence,
        grade,
        programme,
        statut
      }
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