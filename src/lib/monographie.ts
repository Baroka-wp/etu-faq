/** Numéro WhatsApp qui reçoit les demandes de monographie. */
export const MONOGRAPHIE_WHATSAPP = '22967153974'

/** Numéro qui reçoit le dépôt pour la monographie. */
export const MONOGRAPHIE_DEPOT = {
  numero: '+2290167153974',
  affichage: '+229 01 67 15 39 74',
  titulaire: 'Irotori Baroka',
}

export const MONOGRAPHIE_PRIX_DEFAUT = 2000

export function formatPrixFcfa(prix: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(prix)} FCFA`
}

/** Lien WhatsApp avec un message type déjà rédigé. */
export function lienDemandeMonographie({
  nomSacre,
  sujet,
  evenement,
  date,
  prix,
}: {
  nomSacre: string | null
  sujet: string | null
  evenement: string
  date: string
  prix: number
}): string {
  const message = [
    'Bonjour,',
    `Je souhaite acquérir la monographie${sujet ? ` « ${sujet} »` : ''} pour « ${evenement} » du ${date}.`,
    `Prix : ${formatPrixFcfa(prix)}, déposé au ${MONOGRAPHIE_DEPOT.affichage} (${MONOGRAPHIE_DEPOT.titulaire}).`,
    ...(nomSacre ? [`Nom sacré : ${nomSacre}.`] : []),
    'Je joins la capture d’écran du dépôt.',
    'Merci.',
  ].join('\n')
  return `https://wa.me/${MONOGRAPHIE_WHATSAPP}?text=${encodeURIComponent(message)}`
}

/** Sujet de la monographie : la première rubrique renseignée, sinon le titre. */
export function sujetMonographie(seance: {
  instruction: string | null
  seminaire: string | null
  sujetPlanche: string | null
  titre: string
}): string {
  return seance.instruction || seance.sujetPlanche || seance.seminaire || seance.titre
}

/** Les trois rubriques de contenu d'une séance, dans l'ordre d'affichage. */
export const RUBRIQUES_SEANCE = [
  { cle: 'instruction', label: 'Instruction' },
  { cle: 'seminaire', label: 'Séminaire' },
  { cle: 'sujetPlanche', label: 'Sujet de planche' },
] as const

export type RubriqueSeance = (typeof RUBRIQUES_SEANCE)[number]['cle']
