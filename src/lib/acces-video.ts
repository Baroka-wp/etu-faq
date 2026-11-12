export const contributionMinimale = 10000
export function joursAccesRestants(expiration: Date) {
  return Math.max(0, Math.ceil((expiration.getTime() - Date.now()) / 86400000))
}
export function demandeCode(renouvellement = false) {
  const message = renouvellement
    ? 'Bonjour, je souhaite renouveler mon accès à la vidéothèque pour 30 jours. Comment verser ma contribution de 10 000 FCFA ou plus ?'
    : 'Bonjour, je souhaite demander mon code personnel pour accéder à la vidéothèque.'
  return 'https://wa.me/22967153974?text=' + encodeURIComponent(message)
}
