/**
 * Remplit le programme pédagogique d'octobre à décembre 2026 à partir des
 * règles ordinaires de l'École. Aucun lien d'inscription n'est créé.
 * Idempotent : relancer le script réécrit les mêmes dates.
 *
 *   npx tsx prisma/programme-ecole-2026.ts [--dry]
 */
import { db } from '../src/lib/db'

const rad = (degres: number) => (degres * Math.PI) / 180
const SEMAINE = 7 * 86_400_000

/** Nouvelles lunes autour d'un mois (Meeus, chap. 49), heure du Bénin (UTC+1). */
function nouvellesLunes(annee: number, mois: number): Date[] {
  const resultats: Date[] = []
  const kDepart = Math.floor((annee + (mois - 1) / 12 - 2000) * 12.3685) - 1
  for (let k = kDepart; k <= kDepart + 3; k += 1) {
    const T = k / 1236.85
    let jde =
      2451550.09766 + 29.530588861 * k + 0.00015437 * T ** 2 - 0.00000015 * T ** 3 + 0.00000000073 * T ** 4
    const E = 1 - 0.002516 * T - 0.0000074 * T ** 2
    const M = rad(2.5534 + 29.1053567 * k - 0.0000014 * T ** 2 - 0.00000011 * T ** 3)
    const Mp = rad(201.5643 + 385.81693528 * k + 0.0107582 * T ** 2 + 0.00001238 * T ** 3)
    const F = rad(160.7108 + 390.67050284 * k - 0.0016118 * T ** 2 - 0.00000227 * T ** 3)
    const O = rad(124.7746 - 1.56375588 * k + 0.0020672 * T ** 2 + 0.00000215 * T ** 3)
    jde +=
      -0.4072 * Math.sin(Mp) + 0.17241 * E * Math.sin(M) + 0.01608 * Math.sin(2 * Mp) +
      0.01039 * Math.sin(2 * F) + 0.00739 * E * Math.sin(Mp - M) - 0.00514 * E * Math.sin(Mp + M) +
      0.00208 * E * E * Math.sin(2 * M) - 0.00111 * Math.sin(Mp - 2 * F) - 0.00057 * Math.sin(Mp + 2 * F) +
      0.00056 * E * Math.sin(2 * Mp + M) - 0.00042 * Math.sin(3 * Mp) + 0.00042 * E * Math.sin(M + 2 * F) +
      0.00038 * E * Math.sin(M - 2 * F) - 0.00024 * E * Math.sin(2 * Mp - M) - 0.00017 * Math.sin(O) -
      0.00007 * Math.sin(Mp + 2 * M) + 0.00004 * Math.sin(2 * Mp - 2 * F) + 0.00004 * Math.sin(3 * M) +
      0.00003 * Math.sin(Mp + M - 2 * F) + 0.00003 * Math.sin(2 * Mp + 2 * F) -
      0.00003 * Math.sin(Mp + M + 2 * F) + 0.00003 * Math.sin(Mp - M + 2 * F) -
      0.00002 * Math.sin(Mp - M - 2 * F) - 0.00002 * Math.sin(3 * Mp + M) + 0.00002 * Math.sin(4 * Mp)
    const utc = new Date((jde - 2440587.5) * 86_400_000)
    resultats.push(new Date(utc.getTime() + 3_600_000))
  }
  return resultats
}

const jourSemaine = (a: number, m: number, j: number) => new Date(Date.UTC(a, m - 1, j)).getUTCDay()
const nbJours = (a: number, m: number) => new Date(a, m, 0).getDate()
const tousLes = (a: number, m: number, js: number) =>
  Array.from({ length: nbJours(a, m) }, (_, i) => i + 1).filter((j) => jourSemaine(a, m, j) === js)

/** Jours en quinzaine à partir d'une date de référence. */
function quinzaine(a: number, m: number, js: number, ref: { annee: number; mois: number; jour: number }): number[] {
  const depart = Date.UTC(ref.annee, ref.mois - 1, ref.jour)
  return tousLes(a, m, js).filter((j) => {
    const courant = Date.UTC(a, m - 1, j)
    return courant >= depart && Math.round((courant - depart) / SEMAINE) % 2 === 0
  })
}

/** Premier jeudi qui suit chaque nouvelle lune, retenu s'il tombe dans le mois. */
function jeudisApresNouvelleLune(a: number, m: number): number[] {
  const jours: number[] = []
  for (const lune of nouvellesLunes(a, m)) {
    const suivant = new Date(lune)
    do {
      suivant.setUTCDate(suivant.getUTCDate() + 1)
    } while (suivant.getUTCDay() !== 4)
    if (suivant.getUTCFullYear() === a && suivant.getUTCMonth() + 1 === m) jours.push(suivant.getUTCDate())
  }
  return [...new Set(jours)].sort((x, y) => x - y)
}

const PREMIER_LUNDI_OCTOBRE = { annee: 2026, mois: 10, jour: tousLes(2026, 10, 1)[0] }
const DEUXIEME_LUNDI_OCTOBRE = { annee: 2026, mois: 10, jour: tousLes(2026, 10, 1)[1] }

const REGLES: Array<{ titre: string; jours: (a: number, m: number) => number[] }> = [
  { titre: "Travaux d'expansion de l'Égrégore d'ETU", jours: jeudisApresNouvelleLune },
  { titre: 'Cours de Philosophie Ésotérique', jours: (a, m) => tousLes(a, m, 2) },
  { titre: "Cours d'Évangiles Constructeurs", jours: (a, m) => quinzaine(a, m, 1, PREMIER_LUNDI_OCTOBRE) },
  { titre: "Cours d'Évangiles Navigateurs", jours: (a, m) => quinzaine(a, m, 1, DEUXIEME_LUNDI_OCTOBRE) },
  { titre: 'Instruction de Grade Constructeurs', jours: (a, m) => tousLes(a, m, 2).slice(0, 1) },
  { titre: 'Instruction de Grade Navigateurs', jours: (a, m) => tousLes(a, m, 5).slice(3, 4) },
  { titre: 'Instruction des Explorateurs', jours: (a, m) => tousLes(a, m, 5).slice(1, 2) },
  {
    titre: "Cours d'Explorateurs en ligne",
    jours: (a, m) => {
      const vendredis = tousLes(a, m, 5)
      const deuxieme = vendredis[1]
      return [...vendredis.filter((j) => j !== deuxieme), ...tousLes(a, m, 0)].sort((x, y) => x - y)
    },
  },
]

const MOIS = [
  [2026, 10],
  [2026, 11],
  [2026, 12],
] as const

async function main() {
  const simulation = process.argv.includes('--dry')
  const activites = await db.activiteProgramme.findMany({
    where: { categorie: 'ECOLE', actif: true },
    select: { id: true, titre: true, description: true, heures: true, lieu: true, ordre: true },
  })
  const parTitre = new Map(activites.map((activite) => [activite.titre, activite]))

  for (const regle of REGLES) {
    if (!parTitre.has(regle.titre)) throw new Error(`Activité absente du catalogue : ${regle.titre}`)
  }

  for (const [annee, mois] of MOIS) {
    console.log(`\n── ${mois}/${annee}`)
    for (const regle of REGLES) {
      const activite = parTitre.get(regle.titre)!
      const jours = regle.jours(annee, mois)
      console.log(`   ${regle.titre.padEnd(42)} ${jours.join(', ') || '—'}`)
      if (simulation) continue

      await db.programmationMensuelle.upsert({
        where: { activiteId_annee_mois: { activiteId: activite.id, annee, mois } },
        create: {
          activiteId: activite.id,
          annee,
          mois,
          jours,
          titre: activite.titre,
          description: activite.description,
          heures: activite.heures,
          lieu: activite.lieu,
          ordre: activite.ordre,
          visible: true,
        },
        update: { jours, visible: true },
      })
    }
  }

  console.log(
    simulation
      ? '\nSimulation : rien n’a été écrit.'
      : `\n${MOIS.length} mois remplis, sans aucun lien d’inscription.`,
  )
}

main()
  .catch((erreur) => {
    console.error(erreur)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
