import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthorizedAdmin } from '@/lib/security/admin'
import { estTypeRessource } from '@/lib/ressources'

/**
 * Bibliothèque en version courte, pour les sélecteurs (monographie d'une séance…).
 * Filtrable par type : ?type=monographie
 */
export async function GET(request: NextRequest) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const type = request.nextUrl.searchParams.get('type')
  const ressources = await db.book.findMany({
    where: estTypeRessource(type) ? { type } : {},
    orderBy: [{ type: 'asc' }, { title: 'asc' }],
    select: {
      id: true,
      title: true,
      author: true,
      type: true,
      price: true,
      isFree: true,
      imageUrl: true,
      acces: true,
      publie: true,
    },
  })

  return NextResponse.json({ success: true, data: ressources })
}
