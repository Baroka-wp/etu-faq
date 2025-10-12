import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateUserPassword } from '@/lib/password-generator'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      nom,
      prenom,
      sexe,
      dateNaissance,
      heureNaissance,
      lieuNaissance,
      lieuResidence,
      religion,
      telephone
    } = body

    // Validation des champs requis
    if (!nom || !prenom || !sexe || !dateNaissance || !lieuNaissance || !lieuResidence || !religion || !telephone) {
      return NextResponse.json(
        { error: 'Tous les champs marqués d\'un astérisque sont obligatoires' },
        { status: 400 }
      )
    }

    // Générer un mot de passe unique
    const motDePasse = generateUserPassword()

    // Enregistrement dans la base de données
    const inscription = await (prisma as any).inscription.create({
      data: {
        nom,
        prenom,
        sexe,
        dateNaissance,
        heureNaissance: heureNaissance || null,
        lieuNaissance,
        lieuResidence,
        religion,
        telephone,
        motDePasse,
        grade: 'Explorateur',
        programme: 'Initiation',
        statut: 'En attente'
      }
    })


    return NextResponse.json({
      success: true,
      message: 'Inscription enregistrée avec succès',
      id: inscription.id
    })

  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error)
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'enregistrement' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
