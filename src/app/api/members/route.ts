import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createSessionToken } from '@/lib/security/session'
import { getSession, rateLimit, safeJson, safeText } from '@/lib/security/http'
import { getAuthorizedAdmin } from '@/lib/security/admin'
import { cleanSacredNameForStorage } from '@/lib/sacred-name'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  if (!(await getSession(request, 'registration'))) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }
  const limited = rateLimit(request, 'member-registration', 4, 60 * 60 * 1000)
  if (limited) return limited
  try {
    const body = await safeJson<Record<string, unknown>>(request, 24_000)

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
      telephoneWhatsapp,
      lieuResidence,
    } = body

    const fields = {
      nom: safeText(nom, 100), prenoms: safeText(prenoms, 150), email: safeText(email, 254),
      dateNaissance: safeText(dateNaissance, 10), lieuNaissance: safeText(lieuNaissance, 150),
      religionPratique: safeText(religionPratique, 100), telephoneWhatsapp: safeText(telephoneWhatsapp, 30),
      lieuResidence: safeText(lieuResidence, 200),
    }
    if (Object.values(fields).some((value) => !value) || !/^\S+@\S+\.\S+$/.test(fields.email!)) {
      return NextResponse.json(
        { error: 'Les champs obligatoires sont invalides' },
        { status: 400 }
      )
    }

    const cleanNomSacre = cleanSacredNameForStorage(nomSacre)

    // Enregistrement dans la base de données
    const membre = await (prisma as any).membre.create({
      data: {
        nom: fields.nom!,
        prenoms: fields.prenoms!,
        nomSacre: cleanNomSacre,
        profession: safeText(profession, 150),
        email: fields.email!,
        dateNaissance: fields.dateNaissance!,
        heureNaissance: safeText(heureNaissance, 5),
        lieuNaissance: fields.lieuNaissance!,
        religionPratique: fields.religionPratique!,
        appartientAutreOrdre: appartientAutreOrdre === true,
        precisionOrdre: safeText(precisionOrdre, 250),
        grade: 'Explorateur',
        equipage: 'ALEPH',
        telephoneWhatsapp: fields.telephoneWhatsapp!,
        lieuResidence: fields.lieuResidence!,
        statut: 'actif',
        imageUrl: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Membre enregistré avec succès',
      id: membre.id,
      uploadToken: await createSessionToken('upload', membre.id, 10 * 60),
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
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }
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
      },
      select: {
        id: true, nom: true, prenoms: true, nomSacre: true, profession: true, email: true,
        dateNaissance: true, heureNaissance: true, lieuNaissance: true, religionPratique: true,
        appartientAutreOrdre: true, precisionOrdre: true, grade: true, equipage: true,
        telephoneWhatsapp: true, lieuResidence: true, statut: true, role: true, imageUrl: true,
        derniereConnexion: true, createdAt: true, updatedAt: true,
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
