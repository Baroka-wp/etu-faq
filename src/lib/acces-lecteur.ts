import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/security/http'
import { gradeAdmis } from '@/lib/ressources'

export type Lecteur =
  | { genre: 'membre'; id: string; nom: string; grade: string }
  | { genre: 'code'; id: string; libelle: string; collectionId: string | null; ressourceIds: string[] }

/**
 * Qui consulte ? Un membre reconnu par son nom sacré, ou le porteur d'un code.
 * Les droits sont relus en base à chaque requête : retirer un code ou suspendre
 * un membre prend effet immédiatement.
 */
export async function getLecteur(request: NextRequest): Promise<Lecteur | null> {
  const session = await getSession(request, 'lecteur')
  if (!session) return null

  const [genre, identifiant] = session.sub.split(':')

  if (genre === 'membre') {
    const membre = await db.membre.findFirst({
      where: { id: identifiant, statut: 'actif' },
      select: { id: true, nom: true, prenoms: true, nomSacre: true, grade: true },
    })
    if (!membre) return null
    return {
      genre: 'membre',
      id: membre.id,
      nom: membre.nomSacre?.trim() || `${membre.prenoms} ${membre.nom}`.trim(),
      grade: membre.grade,
    }
  }

  if (genre === 'code') {
    const code = await db.codeAcces.findFirst({
      where: {
        id: identifiant,
        actif: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { id: true, libelle: true, collectionId: true, ressources: { select: { bookId: true } } },
    })
    if (!code) return null
    return {
      genre: 'code',
      id: code.id,
      libelle: code.libelle,
      collectionId: code.collectionId,
      ressourceIds: code.ressources.map((lien) => lien.bookId),
    }
  }

  return null
}

type CibleRestreinte = { id: string; acces: string; gradesAutorises: string[] }

/** La collection est-elle ouverte à ce lecteur ? */
export function peutVoirCollection(lecteur: Lecteur | null, collection: CibleRestreinte): boolean {
  if (collection.acces === 'public') return true
  if (!lecteur) return false
  if (lecteur.genre === 'membre') return gradeAdmis(lecteur.grade, collection.gradesAutorises)
  return lecteur.collectionId === collection.id
}

/**
 * La ressource est-elle ouverte à ce lecteur ?
 * `parCollection` vaut vrai quand on la consulte depuis une collection déjà ouverte.
 */
export function peutVoirRessource(
  lecteur: Lecteur | null,
  ressource: CibleRestreinte,
  parCollection = false,
): boolean {
  if (ressource.acces === 'public') return true
  if (!lecteur) return false
  if (lecteur.genre === 'membre') return gradeAdmis(lecteur.grade, ressource.gradesAutorises)
  // Un code ouvre ce qui lui est rattaché, directement ou par sa collection.
  return parCollection || lecteur.ressourceIds.includes(ressource.id)
}

export function nomLecteur(lecteur: Lecteur): string {
  return lecteur.genre === 'membre' ? lecteur.nom : lecteur.libelle
}
