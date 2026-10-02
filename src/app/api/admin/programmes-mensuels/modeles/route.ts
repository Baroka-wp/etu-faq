import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthorizedAdmin } from '@/lib/security/admin'
import { formatAppHourShort } from '@/lib/datetime'

export type Modele = {
  cle: string
  source: 'catalogue' | 'evenement'
  /** Identifiant de l'activité du catalogue, quand le modèle en vient. */
  activiteId: string | null
  categorie: 'TEMPLE' | 'ECOLE' | null
  titre: string
  description: string | null
  heures: string
  lieu: string
  /** Dernière fois que ce modèle a servi, pour trier du plus récent. */
  derniereUtilisation: string | null
  utilisations: number
}

/** Les activités créées « ce mois uniquement » portent un titre technique. */
function titreLisible(titre: string): string {
  return titre.split(' · spécifique ')[0].trim()
}

/**
 * Bibliothèque de modèles : les activités du catalogue, puis les événements
 * déjà tenus hors catalogue, regroupés par titre.
 */
export async function GET(request: NextRequest) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const [activites, evenements] = await Promise.all([
    db.activiteProgramme.findMany({
      orderBy: [{ categorie: 'desc' }, { ordre: 'asc' }],
      select: {
        id: true,
        categorie: true,
        titre: true,
        description: true,
        heures: true,
        lieu: true,
        evenements: { select: { date: true }, orderBy: { date: 'desc' }, take: 1 },
        _count: { select: { evenements: true } },
      },
    }),
    db.traversee.findMany({
      where: { activiteProgrammeId: null },
      orderBy: { date: 'desc' },
      select: { titre: true, description: true, date: true, lieu: true },
    }),
  ])

  const modeles: Modele[] = activites.map((activite) => ({
    cle: `catalogue:${activite.id}`,
    source: 'catalogue',
    activiteId: activite.id,
    categorie: activite.categorie as 'TEMPLE' | 'ECOLE',
    titre: titreLisible(activite.titre),
    description: activite.description,
    heures: activite.heures,
    lieu: activite.lieu,
    derniereUtilisation: activite.evenements[0]?.date.toISOString() ?? null,
    utilisations: activite._count.evenements,
  }))

  // Un seul modèle par titre d'événement passé : le plus récent fait foi.
  const connus = new Set(modeles.map((modele) => modele.titre.toLocaleLowerCase('fr')))
  const parTitre = new Map<string, { modele: Modele; compte: number }>()
  for (const evenement of evenements) {
    const titre = evenement.titre.trim()
    const cle = titre.toLocaleLowerCase('fr')
    if (!titre || connus.has(cle)) continue
    const existant = parTitre.get(cle)
    if (existant) {
      existant.compte += 1
      continue
    }
    parTitre.set(cle, {
      compte: 1,
      modele: {
        cle: `evenement:${cle}`,
        source: 'evenement',
        activiteId: null,
        categorie: null,
        titre,
        description: evenement.description,
        heures: formatAppHourShort(evenement.date),
        lieu: evenement.lieu,
        derniereUtilisation: evenement.date.toISOString(),
        utilisations: 1,
      },
    })
  }

  for (const { modele, compte } of parTitre.values()) {
    modeles.push({ ...modele, utilisations: compte })
  }

  return NextResponse.json({ success: true, data: modeles })
}
