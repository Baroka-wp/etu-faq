import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nomSacre } = body

    // Validation du champ requis
    if (!nomSacre) {
      return NextResponse.json(
        { error: 'Le nom sacré est requis' },
        { status: 400 }
      )
    }

    // Rechercher le membre par nom sacré (insensible à la casse et aux espaces)
    const membre = await (prisma as any).membre.findFirst({
      where: {
        nomSacre: {
          mode: 'insensitive',
          equals: nomSacre.trim()
        },
        statut: 'actif' // Seulement les membres actifs peuvent se connecter
      },
      select: {
        id: true,
        nomSacre: true,
        derniereConnexion: true
      }
    })

    if (!membre) {
      return NextResponse.json(
        { error: 'Nom sacré incorrect ou membre inactif' },
        { status: 404 }
      )
    }

    // Vérifier si c'est la première connexion
    const premiereConnexion = membre.derniereConnexion === null

    return NextResponse.json({
      success: true,
      premiereConnexion,
      nomSacre: membre.nomSacre
    })

  } catch (error) {
    console.error('Erreur lors de la vérification du nom sacré:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la vérification' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
