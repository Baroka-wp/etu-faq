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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lienUnique: string }> }
) {
  try {
    const { lienUnique } = await params
    const body = await request.json()
    const raw = body?.nomSacre

    if (!raw || !String(raw).trim()) {
      return NextResponse.json({ error: 'Le nom sacré est requis' }, { status: 400 })
    }

    const trimmed = String(raw).trim()
    const nomSacreNormalized = normalizeNomSacre(trimmed)

    const traversee = await db.traversee.findUnique({
      where: { lienUnique },
      select: { id: true }
    })

    if (!traversee) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }

    const candidats = await db.membre.findMany({
      where: {
        nomSacre: { contains: trimmed, mode: 'insensitive' },
        statut: 'actif'
      },
      select: { id: true, nomSacre: true }
    })

    const membre = candidats.find(
      (m) => m.nomSacre && normalizeNomSacre(m.nomSacre) === nomSacreNormalized
    )

    if (!membre) {
      return NextResponse.json({ error: 'Nom sacré non reconnu' }, { status: 401 })
    }

    const rows = await db.inscriptionTraversee.findMany({
      where: { traverseeId: traversee.id },
      include: {
        membre: {
          select: { nom: true, prenoms: true, nomSacre: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    const inscrits = rows.map((r) => ({
      nom: r.membre.nom,
      prenoms: r.membre.prenoms,
      nomSacre: r.membre.nomSacre,
    }))

    return NextResponse.json({ success: true, data: inscrits })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
