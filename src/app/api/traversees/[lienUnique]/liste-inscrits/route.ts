import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit, safeJson, safeText } from '@/lib/security/http'
import { findActiveMemberBySacredName } from '@/lib/sacred-name'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lienUnique: string }> }
) {
  const limited = rateLimit(request, 'event-attendee-list', 10, 15 * 60 * 1000)
  if (limited) return limited

  try {
    const { lienUnique } = await params
    const body = await safeJson<Record<string, unknown>>(request, 4_096)
    const nomSacre = safeText(body.nomSacre, 120)
    if (!nomSacre) return NextResponse.json({ error: 'Le nom sacré est requis' }, { status: 400 })

    const [traversee, membre] = await Promise.all([
      db.traversee.findUnique({ where: { lienUnique }, select: { id: true } }),
      findActiveMemberBySacredName(nomSacre),
    ])

    if (!traversee) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }
    if (!membre) {
      return NextResponse.json({ error: 'Aucun membre actif trouvé avec ce nom sacré' }, { status: 404 })
    }

    const rows = await db.inscriptionTraversee.findMany({
      where: { traverseeId: traversee.id },
      select: {
        id: true,
        membre: { select: { nom: true, prenoms: true, nomSacre: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    const inscrits = rows.map((row) => ({
      id: row.id,
      nom: row.membre.nom,
      prenoms: row.membre.prenoms,
      nomSacre: row.membre.nomSacre?.trim() ?? null,
    }))

    return NextResponse.json({ success: true, data: inscrits })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
