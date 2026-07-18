import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthorizedAdmin } from '@/lib/security/admin'

const prisma = new PrismaClient()

function sanitizeNomSacre(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAuthorizedAdmin(request))) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const { id } = await params
    const body = await request.json()

    const {
      nom,
      prenoms,
      nomSacre,
      profession,
      telephoneWhatsapp,
      lieuResidence,
      grade,
      equipage,
      statut,
      role
    } = body

    const cleanNomSacre = sanitizeNomSacre(nomSacre)
    const cleanRole = role === 'ADMIN' ? 'ADMIN' : 'MEMBRE'

    // Mise à jour du membre
    const membre = await (prisma as any).membre.update({
      where: { id },
      data: {
        nom,
        prenoms,
        nomSacre: cleanNomSacre,
        profession: profession || null,
        telephoneWhatsapp,
        lieuResidence,
        grade,
        equipage,
        statut,
        role: cleanRole
      }
    })

    const { motDePasse: _motDePasse, ...safeMembre } = membre
    return NextResponse.json({
      success: true,
      message: 'Membre mis à jour avec succès',
      data: safeMembre
    })

  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du membre:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      )
    }

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
  if (!(await getAuthorizedAdmin(request))) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const { id } = await params

    // Suppression du membre
    await (prisma as any).membre.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Membre supprimé avec succès'
    })

  } catch (error: any) {
    console.error('Erreur lors de la suppression du membre:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAuthorizedAdmin(request))) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const { id } = await params

    // Récupération d'un membre spécifique
    const membre = await (prisma as any).membre.findUnique({
      where: { id }
    })

    if (!membre) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      )
    }

    const { motDePasse: _motDePasse, ...safeMembre } = membre
    return NextResponse.json({
      success: true,
      data: safeMembre
    })

  } catch (error: any) {
    console.error('Erreur lors de la récupération du membre:', error)

    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
