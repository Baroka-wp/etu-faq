/** Vocabulaire partagé de la bibliothèque d'enseignements. */

export const TYPES_RESSOURCE = ['livre', 'monographie', 'ressource'] as const
export type TypeRessource = (typeof TYPES_RESSOURCE)[number]

export const LIBELLES_TYPE: Record<TypeRessource, string> = {
  livre: 'Livre',
  monographie: 'Monographie',
  ressource: 'Ressource',
}

export const ACCES = ['public', 'restreint'] as const
export type Acces = (typeof ACCES)[number]

export const GRADES = ['Explorateur', 'Constructeur', 'Navigateur', 'Alchimiste'] as const

export function estTypeRessource(valeur: unknown): valeur is TypeRessource {
  return typeof valeur === 'string' && (TYPES_RESSOURCE as readonly string[]).includes(valeur)
}

export function estAcces(valeur: unknown): valeur is Acces {
  return typeof valeur === 'string' && (ACCES as readonly string[]).includes(valeur)
}

export function gradesValides(valeur: unknown): string[] {
  if (!Array.isArray(valeur)) return []
  return [...new Set(valeur.filter((g): g is string => typeof g === 'string' && (GRADES as readonly string[]).includes(g)))]
}

/** Un Alchimiste passe partout ; une liste vide n'exclut personne. */
export function gradeAdmis(grade: string, gradesAutorises: string[]): boolean {
  return grade === 'Alchimiste' || gradesAutorises.length === 0 || gradesAutorises.includes(grade)
}

/** Code court, sans caractères ambigus (ni O/0 ni I/1). */
export function genererCode(longueur = 8): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const octets = new Uint8Array(longueur)
  crypto.getRandomValues(octets)
  return Array.from(octets, (octet) => alphabet[octet % alphabet.length]).join('')
}

export function slugifierTitre(titre: string): string {
  return titre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
