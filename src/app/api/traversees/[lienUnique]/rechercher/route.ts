import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lienUnique: string }> }
) {
  try {
    const { lienUnique } = await params
    const nomSacre = request.nextUrl.searchParams.get('nomSacre')

    if (!nomSacre || !nomSacre.trim()) {
      return NextResponse.json({ error: 'Le nom sacré est requis' }, { status: 400 })
    }

    const traversee = await db.traversee.findUnique({
      where: { lienUnique },
      select: { id: true }
    })

    if (!traversee) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }

    const membre = await db.membre.findFirst({
      where: {
        nomSacre: { equals: nomSacre.trim(), mode: 'insensitive' },
        statut: 'actif'
      },
      select: {
        id: true,
        nom: true,
        prenoms: true,
        nomSacre: true,
        grade: true
      }
    })

    if (!membre) {
      return NextResponse.json({ error: 'Aucun membre actif trouvé avec ce nom sacré' }, { status: 404 })
    }

    const alreadyRegistered = await db.inscriptionTraversee.findUnique({
      where: {
        traverseeId_membreId: {
          traverseeId: traversee.id,
          membreId: membre.id
        }
      }
    })

    return NextResponse.json({ success: true, data: membre, dejaInscrit: !!alreadyRegistered })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
