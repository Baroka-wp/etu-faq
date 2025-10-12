import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification admin
    const adminSession = request.cookies.get('admin-session')?.value
    if (adminSession !== 'authenticated') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { statut, grade, programme } = await request.json()

    const updatedInscription = await (prisma as any).inscription.update({
      where: { id },
      data: {
        ...(statut && { statut }),
        ...(grade && { grade }),
        ...(programme && { programme })
      }
    })

    return NextResponse.json(updatedInscription)

  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'inscription:', error)
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification admin
    const adminSession = request.cookies.get('admin-session')?.value
    if (adminSession !== 'authenticated') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params

    await (prisma as any).inscription.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'inscription:', error)
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
