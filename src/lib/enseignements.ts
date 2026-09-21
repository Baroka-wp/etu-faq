import { db } from '@/lib/db'
import { RUBRIQUES_SEANCE, RubriqueSeance } from '@/lib/monographie'

export const LIBELLES_RUBRIQUE: Record<RubriqueSeance, string> = Object.fromEntries(
  RUBRIQUES_SEANCE.map(({ cle, label }) => [cle, label]),
) as Record<RubriqueSeance, string>

/**
 * Recopie dans le journal des enseignements le contenu de séance d'un
 * événement : une entrée par rubrique renseignée, retirée si la rubrique
 * est vidée. À appeler après chaque modification du contenu.
 */
export async function synchroniserEnseignements(traverseeId: string): Promise<void> {
  const traversee = await db.traversee.findUnique({
    where: { id: traverseeId },
    select: {
      id: true,
      titre: true,
      date: true,
      lieu: true,
      instruction: true,
      seminaire: true,
      sujetPlanche: true,
    },
  })
  if (!traversee) return

  await db.$transaction(
    RUBRIQUES_SEANCE.map(({ cle }) => {
      const theme = traversee[cle]?.trim()
      if (!theme) {
        return db.enseignement.deleteMany({ where: { traverseeId, rubrique: cle } })
      }
      const instantane = {
        theme,
        date: traversee.date,
        activite: traversee.titre,
        lieu: traversee.lieu,
      }
      return db.enseignement.upsert({
        where: { traverseeId_rubrique: { traverseeId, rubrique: cle } },
        create: { traverseeId, rubrique: cle, ...instantane },
        update: instantane,
      })
    }),
  )
}
