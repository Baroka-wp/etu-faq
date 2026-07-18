import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from './http'

export async function getAuthorizedAdmin(request: NextRequest) {
  const session = await getSession(request, 'admin')
  if (!session) return null

  // La session globale n'est qu'une clé d'amorçage. Elle cesse de fonctionner
  // dès qu'un premier membre administrateur existe.
  if (session.sub === 'admin') {
    const adminCount = await db.membre.count({ where: { role: 'ADMIN', statut: 'actif' } })
    return adminCount === 0 ? session : null
  }

  const membre = await db.membre.findFirst({
    where: { id: session.sub, role: 'ADMIN', statut: 'actif' },
    select: { id: true },
  })
  return membre ? session : null
}
