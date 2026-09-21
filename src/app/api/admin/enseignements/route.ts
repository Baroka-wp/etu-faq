import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthorizedAdmin } from '@/lib/security/admin'

export async function GET(request: NextRequest) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const enseignements = await db.enseignement.findMany({
    orderBy: [{ date: 'desc' }, { rubrique: 'asc' }],
    include: { traversee: { select: { titre: true, date: true, lieu: true, lienUnique: true } } },
  })

  return NextResponse.json({
    success: true,
    // Tant que l'événement existe, ses valeurs actuelles font foi ;
    // sinon on s'appuie sur ce qui a été recopié.
    data: enseignements.map((item) => ({
      id: item.id,
      rubrique: item.rubrique,
      theme: item.theme,
      date: item.traversee?.date ?? item.date,
      activite: item.traversee?.titre ?? item.activite,
      lieu: item.traversee?.lieu ?? item.lieu,
      lienUnique: item.traversee?.lienUnique ?? null,
    })),
  })
}
