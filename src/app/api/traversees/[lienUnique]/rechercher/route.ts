import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSessionToken } from '@/lib/security/session'
import { rateLimit, safeJson, safeText } from '@/lib/security/http'

function gradeAutorise(membreGrade: string, gradesAutorises: string[]) {
  return membreGrade === 'Alchimiste' || gradesAutorises.length === 0 || gradesAutorises.includes(membreGrade)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lienUnique: string }> }
) {
  const limited = rateLimit(request, 'event-member-verification', 8, 15 * 60 * 1000)
  if (limited) return limited

  try {
    const { lienUnique } = await params
    const body = await safeJson<Record<string, unknown>>(request, 4_096)
    const nomSacre = safeText(body.nomSacre, 120)
    if (!nomSacre) return NextResponse.json({ error: 'Le nom sacré est requis' }, { status: 400 })

    const [traversee, membre] = await Promise.all([
      db.traversee.findUnique({ where: { lienUnique }, select: { id: true, gradesAutorises: true } }),
      db.membre.findFirst({
        where: { nomSacre: { equals: nomSacre, mode: 'insensitive' }, statut: 'actif' },
        select: { id: true, nom: true, prenoms: true, nomSacre: true, grade: true },
      }),
    ])
    if (!traversee) return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })

    if (!membre) {
      return NextResponse.json({ error: 'Aucun membre actif trouvé avec ce nom sacré' }, { status: 404 })
    }
    if (!gradeAutorise(membre.grade, traversee.gradesAutorises)) {
      return NextResponse.json({ error: 'Votre grade ne permet pas cette inscription' }, { status: 403 })
    }

    const alreadyRegistered = await db.inscriptionTraversee.findUnique({
      where: { traverseeId_membreId: { traverseeId: traversee.id, membreId: membre.id } },
      select: { id: true },
    })
    return NextResponse.json({
      success: true,
      data: membre,
      dejaInscrit: Boolean(alreadyRegistered),
      eventToken: await createSessionToken('event', `${membre.id}:${traversee.id}`, 5 * 60),
    })
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}
