import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from './http'

export type ComiteAccess = {
  id: string
  nom: string
  prenoms: string
  nomSacre: string | null
  /** Seul un administrateur fait évoluer les statuts. */
  isAdmin: boolean
}

/**
 * Le cookie ne fait qu'identifier le membre : les droits sont relus en base à
 * chaque requête, pour qu'un retrait du comité prenne effet immédiatement.
 */
export async function getComiteAccess(request: NextRequest): Promise<ComiteAccess | null> {
  const session = await getSession(request, 'comite')
  if (!session) return null

  const membre = await db.membre.findFirst({
    where: {
      id: session.sub,
      statut: 'actif',
      OR: [{ comiteProjets: true }, { role: 'ADMIN' }],
    },
    select: { id: true, nom: true, prenoms: true, nomSacre: true, role: true },
  })
  if (!membre) return null

  return {
    id: membre.id,
    nom: membre.nom,
    prenoms: membre.prenoms,
    nomSacre: membre.nomSacre?.trim() ?? null,
    isAdmin: membre.role === 'ADMIN',
  }
}

export function displayName(membre: { nomSacre: string | null; nom: string; prenoms: string }): string {
  return membre.nomSacre?.trim() || `${membre.prenoms} ${membre.nom}`.trim()
}
