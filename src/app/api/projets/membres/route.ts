import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { displayName, getComiteAccess } from '@/lib/security/comite'

export async function GET(request: NextRequest) {
  if (!(await getComiteAccess(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const membres = await db.membre.findMany({
    where: { statut: 'actif' },
    select: { id: true, nom: true, prenoms: true, nomSacre: true },
    orderBy: [{ nom: 'asc' }, { prenoms: 'asc' }],
  })

  return NextResponse.json({
    membres: membres.map((membre) => ({ id: membre.id, nom: displayName(membre) })),
  })
}
