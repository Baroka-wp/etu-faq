import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthorizedAdmin } from '@/lib/security/admin'
import { safeJson } from '@/lib/security/http'
import { avecNouveauCode } from '@/lib/security/aspirant'
import { contributionMinimale } from '@/lib/acces-video'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAuthorizedAdmin(request))) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { id } = await params
  const body = await safeJson<{ expiration?: string | null; montant?: number }>(request, 2048).catch(() => null)
  const dossier = await db.inscription.findUnique({ where: { id }, select: { statut: true, codeExpireLe: true } })
  if (!body || dossier?.statut !== 'Actif') return NextResponse.json({ error: 'Le dossier doit être actif.' }, { status: 400 })
  if (body.expiration !== (dossier.codeExpireLe?.toISOString() ?? null)) {
    return NextResponse.json({ error: 'Le code a changé. Rechargez le dossier.' }, { status: 409 })
  }
  const montant = body.montant
  if (dossier.codeExpireLe && (typeof montant !== 'number' || !Number.isSafeInteger(montant) || montant < contributionMinimale)) {
    return NextResponse.json({ error: 'Confirmez une contribution reçue d’au moins 10 000 FCFA.' }, { status: 400 })
  }
  const modifie = await avecNouveauCode(code => db.$transaction(async tx => {
    const resultat = await tx.inscription.updateMany({ where: { id, statut: 'Actif', codeExpireLe: dossier.codeExpireLe }, data: code })
    if (resultat.count && dossier.codeExpireLe && montant !== undefined) {
      await tx.payment.create({ data: { inscriptionId: id, type: 'RENOUVELLEMENT_VIDEO', montant, estPaye: true, datePaiement: new Date() } })
    }
    return resultat.count
  }))
  return modifie ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'Le dossier a changé. Rechargez la page.' }, { status: 409 })
}
