import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nomSacre, motDePasse } = body

    // Validation des champs requis
    if (!nomSacre || !motDePasse) {
      return NextResponse.json(
        { error: 'Le nom sacré et le mot de passe sont requis' },
        { status: 400 }
      )
    }

    // Validation de la longueur du mot de passe
    if (motDePasse.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Rechercher le membre par nom sacré
    const membre = await (prisma as any).membre.findFirst({
      where: {
        nomSacre: {
          mode: 'insensitive',
          equals: nomSacre.trim()
        },
        statut: 'actif'
      }
    })

    if (!membre) {
      return NextResponse.json(
        { error: 'Membre non trouvé ou inactif' },
        { status: 404 }
      )
    }

    // Vérifier que c'est bien la première connexion
    if (membre.derniereConnexion !== null) {
      return NextResponse.json(
        { error: 'Ce membre a déjà défini son mot de passe' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10)

    // Mettre à jour le mot de passe et la date de dernière connexion
    const updatedMembre = await (prisma as any).membre.update({
      where: { id: membre.id },
      data: {
        motDePasse: hashedPassword,
        derniereConnexion: new Date()
      },
      select: {
        id: true,
        nom: true,
        prenoms: true,
        nomSacre: true,
        grade: true,
        equipage: true,
        email: true,
        imageUrl: true
      }
    })

    // Créer la session
    const response = NextResponse.json({
      success: true,
      message: 'Mot de passe créé avec succès',
      membre: updatedMembre
    })

    // Définir le cookie de session (30 jours)
    response.cookies.set('membre-session', updatedMembre.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Erreur lors de la création du mot de passe:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du mot de passe' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
