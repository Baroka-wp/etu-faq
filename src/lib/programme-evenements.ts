import { db } from '@/lib/db'
import { parseAppDatetimeLocal } from '@/lib/datetime'
import { slugify } from '@/lib/utils'

export const TOUS_LES_GRADES = ['Explorateur', 'Constructeur', 'Navigateur', 'Alchimiste']

export function pad(valeur: number): string {
  return String(valeur).padStart(2, '0')
}

/** « 9h-12h » → « 09:00 ». Faute de mieux, midi. */
export function heureDebut(heures: string): string {
  const correspondance = heures.match(/(\d{1,2})h(?:(\d{2}))?/i)
  return correspondance ? `${pad(Number(correspondance[1]))}:${correspondance[2] ?? '00'}` : '12:00'
}

export async function slugDisponible(base: string): Promise<string> {
  let candidat = base
  let suffixe = 2
  while (await db.traversee.findUnique({ where: { lienUnique: candidat }, select: { id: true } })) {
    candidat = `${base}-${suffixe++}`
  }
  return candidat
}

export function gradesValides(valeur: unknown): string[] {
  const grades = Array.isArray(valeur)
    ? valeur.filter((grade): grade is string => typeof grade === 'string' && TOUS_LES_GRADES.includes(grade))
    : []
  return grades.length > 0 ? grades : TOUS_LES_GRADES
}

/**
 * Crée le lien public d'une séance pour une date donnée.
 * Si une séance existe déjà ce jour-là pour cette activité, elle est renvoyée
 * telle quelle : la fonction peut être rejouée sans créer de doublon.
 */
export async function creerEvenementPourDate(options: {
  activiteId: string
  annee: number
  mois: number
  jour: number
  gradesAutorises?: unknown
}) {
  const { activiteId, annee, mois, jour } = options
  const programmation = await db.programmationMensuelle.findUnique({
    where: { activiteId_annee_mois: { activiteId, annee, mois } },
    include: { activite: true },
  })
  if (!programmation?.visible) return { evenement: null, cree: false }

  const titre = programmation.titre ?? programmation.activite.titre
  const heures = programmation.heures ?? programmation.activite.heures
  const lieu = programmation.lieu ?? programmation.activite.lieu
  const description =
    programmation.description ?? programmation.activite.description ?? `${titre} · ${heures}`
  const dateYmd = `${annee}-${pad(mois)}-${pad(jour)}`

  const existant = await db.traversee.findFirst({
    where: {
      activiteProgrammeId: activiteId,
      date: {
        gte: parseAppDatetimeLocal(`${dateYmd}T00:00`),
        lte: parseAppDatetimeLocal(`${dateYmd}T23:59`),
      },
    },
    include: { _count: { select: { inscriptions: true } } },
  })
  if (existant) return { evenement: existant, cree: false }

  const evenement = await db.traversee.create({
    data: {
      type: programmation.activite.categorie === 'TEMPLE' ? 'Programme du Temple' : 'Programme pédagogique',
      titre,
      description,
      date: parseAppDatetimeLocal(`${dateYmd}T${heureDebut(heures)}`),
      lieu,
      lienUnique: await slugDisponible(`${slugify(titre)}-${dateYmd}`),
      gradesAutorises: gradesValides(options.gradesAutorises),
      activiteProgrammeId: activiteId,
    },
    include: { _count: { select: { inscriptions: true } } },
  })
  return { evenement, cree: true }
}
