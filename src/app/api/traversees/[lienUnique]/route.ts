import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lienUnique: string }> }
) {
  try {
    const { lienUnique } = await params

    const traversee = await db.traversee.findUnique({
      where: { lienUnique },
      select: {
        id: true,
        type: true,
        titre: true,
        description: true,
        date: true,
        lieu: true,
        lienUnique: true,
        gradesAutorises: true,
        instruction: true,
        seminaire: true,
        sujetPlanche: true,
        monographieActive: true,
        monographiePrix: true,
        monographieImageUrl: true,
        monographieBookId: true,
        monographie: {
          select: { id: true, title: true, price: true, isFree: true, imageUrl: true },
        },
        _count: { select: { inscriptions: true } }
      }
    })

    if (!traversee) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }

    // Quand une ressource est jointe, elle fait foi pour le prix et la couverture ;
    // sinon on garde les valeurs saisies à la main sur la séance.
    const { monographie, monographieBookId: _lien, ...reste } = traversee
    return NextResponse.json({
      success: true,
      data: {
        ...reste,
        monographiePrix: monographie
          ? monographie.isFree
            ? 0
            : Math.round(monographie.price ?? 0)
          : traversee.monographiePrix,
        monographieImageUrl: monographie?.imageUrl || traversee.monographieImageUrl,
        monographieTitre: monographie?.title ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
