import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateUserPassword } from '@/lib/password-generator'
import { rateLimit, safeJson, safeText } from '@/lib/security/http'
import { protectCredential } from '@/lib/security/credential'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'public-inscription', 4, 60 * 60 * 1000)
  if (limited) return limited
  try {
    const body = await safeJson<Record<string, unknown>>(request, 20_000)
    
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
    const clean = {
      nom: safeText(nom, 100), prenom: safeText(prenom, 150), sexe: safeText(sexe, 30),
      dateNaissance: safeText(dateNaissance, 10), lieuNaissance: safeText(lieuNaissance, 150),
      lieuResidence: safeText(lieuResidence, 200), religion: safeText(religion, 100), telephone: safeText(telephone, 30),
    }
    if (Object.values(clean).some((value) => !value)) {
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
        nom: clean.nom!,
        prenom: clean.prenom!,
        sexe: clean.sexe!,
        dateNaissance: clean.dateNaissance!,
        heureNaissance: safeText(heureNaissance, 5),
        lieuNaissance: clean.lieuNaissance!,
        lieuResidence: clean.lieuResidence!,
        religion: clean.religion!,
        telephone: clean.telephone!,
        motDePasse: await protectCredential(motDePasse),
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
