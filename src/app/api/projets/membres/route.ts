import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { displayName, getComiteAccess } from '@/lib/security/comite'

export async function GET(request: NextRequest) {
  if (!(await getComiteAccess(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Un projet ne se confie qu'au comité de suivi et aux administrateurs.
  const membres = await db.membre.findMany({
    where: {
      statut: 'actif',
      OR: [{ comiteProjets: true }, { role: 'ADMIN' }],
    },
    select: { id: true, nom: true, prenoms: true, nomSacre: true, role: true, comiteProjets: true },
    orderBy: [{ nom: 'asc' }, { prenoms: 'asc' }],
  })

  return NextResponse.json({
    membres: membres.map((membre) => ({
      id: membre.id,
      nom: displayName(membre),
      isAdmin: membre.role === 'ADMIN',
      // Un administrateur entre d'office, sans avoir été désigné au comité.
      designe: membre.comiteProjets,
    })),
  })
}
