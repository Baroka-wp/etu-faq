import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthorizedAdmin } from '@/lib/security/admin'

/** Liste légère des membres actifs, pour les sélections à cocher. */
export async function GET(request: NextRequest) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const membres = await db.membre.findMany({
    where: { statut: 'actif' },
    select: { id: true, nom: true, prenoms: true, nomSacre: true, grade: true, equipage: true },
    orderBy: [{ nom: 'asc' }, { prenoms: 'asc' }],
  })

  return NextResponse.json({
    success: true,
    data: membres.map((membre) => ({ ...membre, nomSacre: membre.nomSacre?.trim() ?? null })),
  })
}
