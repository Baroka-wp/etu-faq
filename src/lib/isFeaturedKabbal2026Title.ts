/**
 * Repère le titre de la vidéo mise en avant sur l'accueil (« Pourquoi étudier la Kabbale en 2026 »),
 * quelle que soit la casse ou les accents (ex. « etudier » / « étudier »).
 */
export function isFeaturedKabbal2026Title(title: string) {
  const n = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
  return n.includes('pourquoi') && n.includes('kabbale') && n.includes('2026')
}
