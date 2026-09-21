import { db } from '@/lib/db'

export function gradeAutorise(grade: string, gradesAutorises: string[]): boolean {
  return grade === 'Alchimiste' || gradesAutorises.length === 0 || gradesAutorises.includes(grade)
}

/**
 * Inscrit d'un coup plusieurs membres à un événement.
 * Seuls les membres actifs dont le grade est autorisé sont retenus ;
 * un membre déjà inscrit est ignoré sans erreur.
 */
export async function inscrireMembresCoches(
  traverseeId: string,
  gradesAutorises: string[],
  membreIds: unknown,
): Promise<number> {
  if (!Array.isArray(membreIds) || membreIds.length === 0) return 0
  const ids = [
    ...new Set(membreIds.filter((id): id is string => typeof id === 'string' && id.length <= 120)),
  ].slice(0, 1_000)
  if (ids.length === 0) return 0

  const membres = await db.membre.findMany({
    where: { id: { in: ids }, statut: 'actif' },
    select: { id: true, grade: true },
  })
  const autorises = membres.filter((membre) => gradeAutorise(membre.grade, gradesAutorises))
  if (autorises.length === 0) return 0

  const resultat = await db.inscriptionTraversee.createMany({
    data: autorises.map((membre) => ({ traverseeId, membreId: membre.id })),
    skipDuplicates: true,
  })
  return resultat.count
}
