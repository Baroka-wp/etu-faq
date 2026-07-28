// Calcul du taux de participation des membres aux traversées qui les concernent.
// Une traversée "concerne" un membre si son grade y est autorisé (Alchimiste : toutes,
// gradesAutorises vide : toutes). Seules les traversées déjà passées, postérieures
// à l'arrivée du membre et ayant réuni au moins MIN_INSCRITS_TRAVERSEE inscrits
// entrent dans le calcul (les événements quasi vides ne sont pas représentatifs).

export const MIN_INSCRITS_TRAVERSEE = 3

export interface TraverseePourParticipation {
  id: string
  date: Date
  gradesAutorises: string[]
}

export interface ParticipationStats {
  concernees: number
  participations: number
  taux: number | null // pourcentage arrondi, null si aucune traversée concernée
}

export function traverseeConcerneMembre(
  gradesAutorises: string[],
  grade: string
): boolean {
  if (grade === 'Alchimiste') return true
  if (!gradesAutorises || gradesAutorises.length === 0) return true
  return gradesAutorises.includes(grade)
}

export function computeParticipation(
  traverseesPassees: TraverseePourParticipation[],
  membre: { grade: string; createdAt: Date },
  traverseeIdsInscrites: Set<string>,
  inscritsParTraversee: Map<string, number>
): ParticipationStats {
  const concernees = traverseesPassees.filter(
    (t) =>
      t.date >= membre.createdAt &&
      (inscritsParTraversee.get(t.id) ?? 0) >= MIN_INSCRITS_TRAVERSEE &&
      traverseeConcerneMembre(t.gradesAutorises, membre.grade)
  )

  const participations = concernees.filter((t) =>
    traverseeIdsInscrites.has(t.id)
  ).length

  return {
    concernees: concernees.length,
    participations,
    taux:
      concernees.length === 0
        ? null
        : Math.round((participations / concernees.length) * 100),
  }
}
