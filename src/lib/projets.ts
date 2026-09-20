export const PROJET_STATUTS = ['propose', 'en_cours', 'termine', 'suspendu'] as const
export type ProjetStatut = (typeof PROJET_STATUTS)[number]

export const TACHE_STATUTS = ['a_faire', 'en_cours', 'terminee', 'bloquee'] as const
export type TacheStatut = (typeof TACHE_STATUTS)[number]

export const PROJET_STATUT_LABELS: Record<ProjetStatut, string> = {
  propose: 'Proposé',
  en_cours: 'En cours',
  termine: 'Achevé',
  suspendu: 'En pause',
}

export const TACHE_STATUT_LABELS: Record<TacheStatut, string> = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  terminee: 'Terminée',
  bloquee: 'Bloquée',
}

export function isProjetStatut(value: string): value is ProjetStatut {
  return (PROJET_STATUTS as readonly string[]).includes(value)
}

export function isTacheStatut(value: string): value is TacheStatut {
  return (TACHE_STATUTS as readonly string[]).includes(value)
}
