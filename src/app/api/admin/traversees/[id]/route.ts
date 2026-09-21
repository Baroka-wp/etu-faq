import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthorizedAdmin } from '@/lib/security/admin'
import { isSameOrigin, safeHttpUrl, safeJson, safeText } from '@/lib/security/http'

/** Contenu de la séance et monographie d'un événement. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })

  try {
    const { id } = await params
    const body = await safeJson<Record<string, unknown>>(request, 16_384)
    const data: Record<string, unknown> = {}

    for (const cle of ['instruction', 'seminaire', 'sujetPlanche'] as const) {
      if (body[cle] !== undefined) data[cle] = safeText(body[cle], 1_000)
    }

    if (body.monographieActive !== undefined) data.monographieActive = body.monographieActive === true

    if (body.monographiePrix !== undefined) {
      const prix = Number(body.monographiePrix)
      if (!Number.isInteger(prix) || prix < 0 || prix > 1_000_000) {
        return NextResponse.json({ error: 'Prix invalide' }, { status: 400 })
      }
      data.monographiePrix = prix
    }

    if (body.monographieImageUrl !== undefined) {
      if (body.monographieImageUrl === null || body.monographieImageUrl === '') {
        data.monographieImageUrl = null
      } else {
        const url = safeHttpUrl(body.monographieImageUrl)
        if (!url) return NextResponse.json({ error: 'Image invalide' }, { status: 400 })
        data.monographieImageUrl = url
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Aucune modification' }, { status: 400 })
    }

    const evenement = await db.traversee.update({
      where: { id },
      data,
      select: {
        id: true,
        instruction: true,
        seminaire: true,
        sujetPlanche: true,
        monographieActive: true,
        monographiePrix: true,
        monographieImageUrl: true,
      },
    })
    return NextResponse.json({ success: true, data: evenement })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Enregistrement impossible' }, { status: 400 })
  }
}
