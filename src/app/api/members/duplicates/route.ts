import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthorizedAdmin } from '@/lib/security/admin'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  if (!(await getAuthorizedAdmin(request))) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    // Utiliser une requête raw pour trouver les doublons de nomSacre
    // On groupe par nomSacre et on ne garde que ceux qui apparaissent plus d'une fois
    const duplicates = await prisma.$queryRaw`
      SELECT "nomSacre", COUNT(*) as count
      FROM "Membre"
      WHERE "nomSacre" IS NOT NULL AND "nomSacre" != ''
      GROUP BY "nomSacre"
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `

    // Pour chaque nomSacre en doublon, récupérer les membres associés
    const duplicatesWithMembers: Record<string, any[]> = {}
    
    for (const dup of duplicates as any[]) {
      const membres = await prisma.membre.findMany({
        where: {
          nomSacre: dup.nomSacre
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true, nom: true, prenoms: true, nomSacre: true, email: true,
          grade: true, equipage: true, statut: true, role: true, telephoneWhatsapp: true,
          lieuResidence: true, createdAt: true,
        },
      })
      duplicatesWithMembers[dup.nomSacre] = membres
    }

    return NextResponse.json({
      success: true,
      data: duplicatesWithMembers,
      count: Object.keys(duplicatesWithMembers).length
    })

  } catch (error: any) {
    console.error('Erreur lors de la détection des doublons:', error)

    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la détection des doublons' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
