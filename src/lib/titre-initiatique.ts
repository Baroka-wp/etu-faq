/** Titre porté devant le nom sacré selon le grade. */
export function titreDeGrade(grade: string): string {
  if (grade === 'Alchimiste') return 'R°H°'
  if (grade === 'Navigateur' || grade === 'Constructeur') return 'H°'
  return ''
}

/**
 * « R°H° LAHERIEL (SODEGLA Victor) » : titre, nom sacré, puis nom civil.
 * Sans nom sacré, seul le nom civil est affiché.
 */
export function nomInitiatique(membre: {
  nomSacre: string | null
  nom: string
  prenoms: string
  grade: string
}): { principal: string; civil: string | null } {
  const civil = `${membre.nom} ${membre.prenoms}`.trim()
  if (!membre.nomSacre) return { principal: civil, civil: null }
  const titre = titreDeGrade(membre.grade)
  return { principal: `${titre ? `${titre} ` : ''}${membre.nomSacre}`, civil }
}
