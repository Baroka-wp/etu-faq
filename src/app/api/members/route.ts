import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      nom,
      prenoms,
      nomSacre,
      profession,
      email,
      dateNaissance,
      heureNaissance,
      lieuNaissance,
      religionPratique,
      appartientAutreOrdre,
      precisionOrdre,
      grade,
      equipage,
      telephoneWhatsapp,
      lieuResidence,
      statut,
      imageUrl
    } = body

    // Validation des champs requis
    if (!nom || !prenoms || !email || !dateNaissance || !lieuNaissance || !religionPratique || !telephoneWhatsapp || !lieuResidence) {
      return NextResponse.json(
        { error: 'Tous les champs marqués d\'un astérisque sont obligatoires' },
        { status: 400 }
      )
    }

    // Enregistrement dans la base de données
    const membre = await (prisma as any).membre.create({
      data: {
        nom,
        prenoms,
        nomSacre: nomSacre || null,
        profession: profession || null,
        email,
        dateNaissance,
        heureNaissance: heureNaissance || null,
        lieuNaissance,
        religionPratique,
        appartientAutreOrdre: appartientAutreOrdre || false,
        precisionOrdre: precisionOrdre || null,
        grade: grade || 'Explorateur',
        equipage: equipage || 'ALEPH',
        telephoneWhatsapp,
        lieuResidence,
        statut: statut || 'actif',
        imageUrl: imageUrl || null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Membre enregistré avec succès',
      id: membre.id
    })

  } catch (error: any) {
    console.error('Erreur lors de l\'enregistrement du membre:', error)

    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'enregistrement' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const statut = searchParams.get('statut')
    const grade = searchParams.get('grade')

    const where: any = {}

    if (statut) {
      where.statut = statut
    }

    if (grade) {
      where.grade = grade
    }

    const membres = await (prisma as any).membre.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: membres
    })

  } catch (error: any) {
    console.error('Erreur lors de la récupération des membres:', error)

    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des données' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
