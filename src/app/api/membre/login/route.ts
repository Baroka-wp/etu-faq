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

    // Rechercher le membre par nom sacré (insensible à la casse et aux espaces)
    const membre = await (prisma as any).membre.findFirst({
      where: {
        nomSacre: {
          mode: 'insensitive',
          equals: nomSacre.trim()
        },
        statut: 'actif' // Seulement les membres actifs peuvent se connecter
      }
    })

    if (!membre) {
      return NextResponse.json(
        { error: 'Nom sacré ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier si le membre a un mot de passe configuré
    if (!membre.motDePasse) {
      return NextResponse.json(
        {
          error: 'Votre mot de passe n\'a pas encore été configuré. Veuillez contacter l\'administrateur.',
          code: 'NO_PASSWORD'
        },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(motDePasse, membre.motDePasse)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Nom sacré ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Mettre à jour la date de dernière connexion
    await (prisma as any).membre.update({
      where: { id: membre.id },
      data: { derniereConnexion: new Date() }
    })

    // Créer la session
    const response = NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      membre: {
        id: membre.id,
        nom: membre.nom,
        prenoms: membre.prenoms,
        nomSacre: membre.nomSacre,
        grade: membre.grade,
        equipage: membre.equipage,
        email: membre.email,
        imageUrl: membre.imageUrl
      }
    })

    // Définir le cookie de session (30 jours)
    response.cookies.set('membre-session', membre.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
