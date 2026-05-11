import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function normalizeNomSacre(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function gradeAutorise(membreGrade: string, gradesAutorises: string[]): boolean {
  if (membreGrade === 'Alchimiste') return true
  if (gradesAutorises.length === 0) return true
  return gradesAutorises.includes(membreGrade)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lienUnique: string }> }
) {
  try {
    const { lienUnique } = await params
    const { nomSacre } = await request.json()

    if (!nomSacre || !nomSacre.trim()) {
      return NextResponse.json({ error: 'Le nom sacré est requis' }, { status: 400 })
    }

    const traversee = await db.traversee.findUnique({
      where: { lienUnique },
      select: { id: true, gradesAutorises: true }
    })
    if (!traversee) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }

    const nomSacreNormalized = normalizeNomSacre(nomSacre)
    const candidats = await db.membre.findMany({
      where: {
        nomSacre: { contains: nomSacre.trim(), mode: 'insensitive' },
        statut: 'actif'
      },
      select: { id: true, nom: true, prenoms: true, nomSacre: true, grade: true }
    })
    const membre = candidats.find((item) =>
      item.nomSacre && normalizeNomSacre(item.nomSacre) === nomSacreNormalized
    )

    if (!membre) {
      return NextResponse.json({ error: 'Aucun membre actif trouvé avec ce nom sacré' }, { status: 404 })
    }

    // Vérification du grade (double sécurité côté serveur)
    if (!gradeAutorise(membre.grade, traversee.gradesAutorises)) {
      return NextResponse.json(
        { error: `Cet événement est réservé à certains grades. Votre grade (${membre.grade}) ne vous y autorise pas.` },
        { status: 403 }
      )
    }

    await db.inscriptionTraversee.create({
      data: { traverseeId: traversee.id, membreId: membre.id }
    })

    return NextResponse.json({ success: true, message: 'Inscription confirmée avec succès', membre })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce membre est déjà inscrit à cet événement' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
