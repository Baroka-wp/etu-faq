import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { db } from '@/lib/db'
import { getAuthorizedAdmin } from '@/lib/security/admin'
import { formatAppDateYMD } from '@/lib/datetime'

const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]
const JOURS = ['D', 'L', 'Ma', 'Me', 'J', 'V', 'S']

const IDENTITE = {
  TEMPLE: {
    organisation: 'Ordre des Marins Pêcheurs (OMP)',
    titre: 'Programme du Temple',
    couleur: 'FF087F38',
  },
  ECOLE: {
    organisation: 'École Transcendantaliste Universelle (ETU)',
    titre: 'Programme Pédagogique',
    couleur: 'FF111111',
  },
} as const

type Categorie = keyof typeof IDENTITE

type Ligne = {
  titre: string
  heures: string
  lieu: string
  jours: number[]
  /** Lien public d'inscription par jour, quand il existe. */
  liens: Map<number, string>
}

type Seance = {
  annee: number
  mois: number
  jour: number
  categorie: Categorie
  activite: string
  heures: string
  lieu: string
  lien: string
  inscrits: number
}

const TITRE_CLASSEUR = 'Calendrier des activités ordinaires ETU'

const JAUNE = 'FFFFF4B8'
/** Rose des cases cochées, identique au calendrier à l'écran. */
const ROSE = 'FFEFACD9'
const BRUN = 'FF69571A'
const TRAIT = { style: 'thin' as const, color: { argb: 'FF9CA3AF' } }
const BORDURE = { top: TRAIT, left: TRAIT, bottom: TRAIT, right: TRAIT }

/** Emblème de l'Ordre, lu une seule fois par processus. */
let logoEnCache: Buffer | null | undefined
async function lireLogo(): Promise<Buffer | null> {
  if (logoEnCache !== undefined) return logoEnCache
  try {
    logoEnCache = await readFile(path.join(process.cwd(), 'public', 'icon-192.png'))
  } catch {
    // Sans logo, l'export reste parfaitement utilisable.
    logoEnCache = null
  }
  return logoEnCache
}

function pad(valeur: number) {
  return String(valeur).padStart(2, '0')
}

function moisValide(annee: number, mois: number) {
  return (
    Number.isInteger(annee) && annee >= 2020 && annee <= 2100 &&
    Number.isInteger(mois) && mois >= 1 && mois <= 12
  )
}

/** En-tête de la feuille : l'emblème, le titre unique et la période. */
function ecrireEnteteFeuille(
  feuille: ExcelJS.Worksheet,
  periodeLabel: string,
  colonnes: number,
  logoId?: number,
): number {
  const derniereColonne = feuille.getColumn(colonnes).letter

  feuille.mergeCells(`A1:${derniereColonne}1`)
  const titre = feuille.getCell('A1')
  titre.value = TITRE_CLASSEUR
  titre.font = { size: 18, bold: true, color: { argb: 'FF111111' } }
  titre.alignment = { horizontal: 'center', vertical: 'middle' }
  feuille.getRow(1).height = 30

  feuille.mergeCells(`A2:${derniereColonne}2`)
  const periode = feuille.getCell('A2')
  periode.value = periodeLabel
  periode.font = { size: 13, bold: true, color: { argb: 'FF69571A' } }
  periode.alignment = { horizontal: 'center', vertical: 'middle' }
  feuille.getRow(2).height = 22

  if (logoId !== undefined) {
    for (const colonne of [0.15, colonnes - 2.4]) {
      feuille.addImage(logoId, {
        tl: { col: colonne, row: 0.1 },
        ext: { width: 66, height: 66 },
        editAs: 'absolute',
      })
    }
  }

  return 4
}

/** Dessine un programme (en-tête, colonnes des jours, une ligne par activité). */
function ecrireProgramme(
  feuille: ExcelJS.Worksheet,
  categorie: Categorie,
  annee: number,
  mois: number,
  lignes: Ligne[],
  depart: number,
  sousTitre: string,
): number {
  const nombreJours = new Date(annee, mois, 0).getDate()
  const colonnes = 4 + nombreJours
  const identite = IDENTITE[categorie]
  const derniereColonne = feuille.getColumn(colonnes).letter
  let ligneCourante = depart

  // Un seul intitulé par bloc : le programme, ou le mois selon la disposition.
  feuille.mergeCells(`A${ligneCourante}:${derniereColonne}${ligneCourante}`)
  const entete = feuille.getCell(`A${ligneCourante}`)
  entete.value = sousTitre
  entete.font = { size: 13, bold: true, color: { argb: identite.couleur } }
  entete.alignment = { horizontal: 'left', vertical: 'middle' }
  feuille.getRow(ligneCourante).height = 22
  ligneCourante += 1

  // Deux lignes d'en-tête : la lettre du jour, puis son numéro.
  const enTeteLettres = feuille.getRow(ligneCourante)
  const enTeteNumeros = feuille.getRow(ligneCourante + 1)
  const intitules = ['N°', 'ACTIVITÉS', 'HEURES', 'LIEUX']

  intitules.forEach((intitule, index) => {
    const colonne = index + 1
    feuille.mergeCells(ligneCourante, colonne, ligneCourante + 1, colonne)
    const cellule = enTeteLettres.getCell(colonne)
    cellule.value = intitule
    cellule.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  })

  for (let jour = 1; jour <= nombreJours; jour += 1) {
    const colonne = 4 + jour
    enTeteLettres.getCell(colonne).value = JOURS[new Date(annee, mois - 1, jour).getDay()]
    enTeteNumeros.getCell(colonne).value = jour
  }

  for (const ligne of [enTeteLettres, enTeteNumeros]) {
    for (let colonne = 1; colonne <= colonnes; colonne += 1) {
      const cellule = ligne.getCell(colonne)
      cellule.font = { bold: true, size: 10, color: { argb: BRUN } }
      cellule.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: JAUNE } }
      cellule.alignment = { horizontal: 'center', vertical: 'middle' }
      cellule.border = BORDURE
    }
  }
  ligneCourante += 2

  lignes.forEach((ligne, index) => {
    const rangee = feuille.getRow(ligneCourante)
    rangee.getCell(1).value = index + 1
    rangee.getCell(2).value = ligne.titre
    rangee.getCell(3).value = ligne.heures
    rangee.getCell(4).value = ligne.lieu

    const coches = new Set(ligne.jours)
    for (let jour = 1; jour <= nombreJours; jour += 1) {
      if (!coches.has(jour)) continue
      const cellule = rangee.getCell(4 + jour)
      const lien = ligne.liens.get(jour)
      if (lien) {
        cellule.value = { text: 'X', hyperlink: lien, tooltip: lien }
      } else {
        cellule.value = 'X'
      }
      cellule.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROSE } }
    }

    for (let colonne = 1; colonne <= colonnes; colonne += 1) {
      const cellule = rangee.getCell(colonne)
      cellule.border = BORDURE
      const estLien = colonne > 4 && typeof cellule.value === 'object' && cellule.value !== null
      cellule.font = {
        size: 10,
        bold: colonne > 4,
        underline: estLien,
        color: { argb: estLien ? 'FF1D4ED8' : 'FF111111' },
      }
      cellule.alignment = {
        horizontal: colonne === 2 ? 'left' : 'center',
        vertical: 'middle',
        wrapText: colonne === 2,
      }
    }
    rangee.height = 20
    ligneCourante += 1
  })

  if (lignes.length === 0) {
    feuille.mergeCells(`A${ligneCourante}:${derniereColonne}${ligneCourante}`)
    const cellule = feuille.getCell(`A${ligneCourante}`)
    cellule.value = 'Aucune activité pour ce mois'
    cellule.font = { italic: true, size: 10, color: { argb: 'FF6B7280' } }
    cellule.alignment = { horizontal: 'center' }
    ligneCourante += 1
  }

  return ligneCourante + 2
}

function largeurs(feuille: ExcelJS.Worksheet, nombreJours: number) {
  feuille.getColumn(1).width = 5
  feuille.getColumn(2).width = 44
  feuille.getColumn(3).width = 13
  feuille.getColumn(4).width = 15
  for (let jour = 1; jour <= nombreJours; jour += 1) feuille.getColumn(4 + jour).width = 4
}

/** Feuille récapitulative des liens publics d'inscription. */
function ecrireFeuilleLiens(classeur: ExcelJS.Workbook, seances: Seance[]) {
  const feuille = classeur.addWorksheet("Liens d'inscription", {
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    views: [{ state: 'frozen', ySplit: 1 }],
  })
  const colonnes = [
    { header: 'Date', width: 14 },
    { header: 'Programme', width: 12 },
    { header: 'Activité', width: 44 },
    { header: 'Heures', width: 13 },
    { header: 'Lieu', width: 15 },
    { header: 'Inscrits', width: 10 },
    { header: "Lien d'inscription", width: 62 },
  ]
  feuille.columns = colonnes.map((colonne) => ({ width: colonne.width }))

  const enTete = feuille.getRow(1)
  colonnes.forEach((colonne, index) => {
    const cellule = enTete.getCell(index + 1)
    cellule.value = colonne.header
    cellule.font = { bold: true, size: 10, color: { argb: BRUN } }
    cellule.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: JAUNE } }
    cellule.alignment = { horizontal: 'center', vertical: 'middle' }
    cellule.border = BORDURE
  })
  enTete.height = 22

  seances
    .slice()
    .sort((a, b) =>
      a.annee - b.annee || a.mois - b.mois || a.jour - b.jour || a.activite.localeCompare(b.activite),
    )
    .forEach((seance, index) => {
      const rangee = feuille.getRow(index + 2)
      rangee.getCell(1).value = `${String(seance.jour).padStart(2, '0')}/${String(seance.mois).padStart(2, '0')}/${seance.annee}`
      rangee.getCell(2).value = seance.categorie === 'TEMPLE' ? 'Temple' : 'École'
      rangee.getCell(3).value = seance.activite
      rangee.getCell(4).value = seance.heures
      rangee.getCell(5).value = seance.lieu
      rangee.getCell(6).value = seance.inscrits
      const cellule = rangee.getCell(7)
      cellule.value = { text: seance.lien, hyperlink: seance.lien }
      cellule.font = { size: 10, underline: true, color: { argb: 'FF1D4ED8' } }

      for (let colonne = 1; colonne <= 7; colonne += 1) {
        const courante = rangee.getCell(colonne)
        courante.border = BORDURE
        if (colonne !== 7) courante.font = { size: 10 }
        courante.alignment = {
          horizontal: colonne === 3 || colonne === 7 ? 'left' : 'center',
          vertical: 'middle',
          wrapText: colonne === 3,
        }
      }
      rangee.height = 20
    })

  if (seances.length === 0) {
    const cellule = feuille.getCell('A2')
    cellule.value = "Aucun lien d'inscription sur la période choisie"
    cellule.font = { italic: true, size: 10, color: { argb: 'FF6B7280' } }
  }
}

/** Liste des mois d'une période, bornée pour éviter un classeur démesuré. */
function moisDeLaPeriode(
  debut: { annee: number; mois: number },
  fin: { annee: number; mois: number },
): Array<{ annee: number; mois: number }> {
  const liste: Array<{ annee: number; mois: number }> = []
  let annee = debut.annee
  let mois = debut.mois
  while ((annee < fin.annee || (annee === fin.annee && mois <= fin.mois)) && liste.length < 24) {
    liste.push({ annee, mois })
    mois += 1
    if (mois > 12) {
      mois = 1
      annee += 1
    }
  }
  return liste
}

function lireMois(valeur: string | null): { annee: number; mois: number } | null {
  const correspondance = /^(\d{4})-(\d{1,2})$/.exec(valeur ?? '')
  if (!correspondance) return null
  const annee = Number(correspondance[1])
  const mois = Number(correspondance[2])
  return moisValide(annee, mois) ? { annee, mois } : null
}

export async function GET(request: NextRequest) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const parametres = request.nextUrl.searchParams
  const debut = lireMois(parametres.get('debut'))
  const fin = lireMois(parametres.get('fin')) ?? debut
  if (!debut || !fin) {
    return NextResponse.json({ error: 'Période invalide' }, { status: 400 })
  }
  const periodes = moisDeLaPeriode(debut, fin)
  if (periodes.length === 0) {
    return NextResponse.json({ error: 'La fin est antérieure au début' }, { status: 400 })
  }

  const demandees = (parametres.get('categories') || 'TEMPLE,ECOLE')
    .split(',')
    .filter((valeur): valeur is Categorie => valeur === 'TEMPLE' || valeur === 'ECOLE')
  const categories = demandees.length > 0 ? demandees : (['TEMPLE', 'ECOLE'] as Categorie[])
  const fusion = parametres.get('fusion') === '1'
  const avecLiens = parametres.get('liens') !== '0'

  const filtreMois = periodes.map(({ annee, mois }) => ({ annee, mois }))
  const [programmations, evenements] = await Promise.all([
    db.programmationMensuelle.findMany({
      where: { OR: filtreMois, visible: true, activite: { categorie: { in: categories } } },
      orderBy: [{ annee: 'asc' }, { mois: 'asc' }, { ordre: 'asc' }, { createdAt: 'asc' }],
      include: { activite: true },
    }),
    db.traversee.findMany({
      where: {
        activiteProgrammeId: { not: null },
        date: {
          gte: new Date(Date.UTC(periodes[0].annee, periodes[0].mois - 1, 1)),
          lt: new Date(Date.UTC(
            periodes[periodes.length - 1].mois === 12 ? periodes[periodes.length - 1].annee + 1 : periodes[periodes.length - 1].annee,
            periodes[periodes.length - 1].mois === 12 ? 0 : periodes[periodes.length - 1].mois,
            1,
          )),
        },
      },
      select: {
        activiteProgrammeId: true,
        date: true,
        lienUnique: true,
        _count: { select: { inscriptions: true } },
      },
    }),
  ])

  const origine = request.nextUrl.origin
  // Index des liens : activité + date exacte.
  const liensParCle = new Map<string, { lien: string; inscrits: number }>()
  for (const evenement of evenements) {
    const jourYmd = formatAppDateYMD(evenement.date)
    liensParCle.set(`${evenement.activiteProgrammeId}:${jourYmd}`, {
      lien: `${origine}/traversee/${evenement.lienUnique}`,
      inscrits: evenement._count.inscriptions,
    })
  }

  const seances: Seance[] = []
  // lignes[annee-mois][categorie]
  const lignes = new Map<string, Map<Categorie, Ligne[]>>()
  for (const { annee, mois } of periodes) {
    lignes.set(`${annee}-${mois}`, new Map(categories.map((categorie) => [categorie, [] as Ligne[]])))
  }

  for (const programmation of programmations) {
    const categorie = programmation.activite.categorie as Categorie
    const titre = programmation.titre ?? programmation.activite.titre
    const heures = programmation.heures ?? programmation.activite.heures
    const lieu = programmation.lieu ?? programmation.activite.lieu
    const jours = [...programmation.jours].sort((a, b) => a - b)
    const liens = new Map<number, string>()

    for (const jour of jours) {
      const cle = `${programmation.activiteId}:${programmation.annee}-${pad(programmation.mois)}-${pad(jour)}`
      const trouve = liensParCle.get(cle)
      if (!trouve) continue
      liens.set(jour, trouve.lien)
      seances.push({
        annee: programmation.annee,
        mois: programmation.mois,
        jour,
        categorie,
        activite: titre,
        heures,
        lieu,
        lien: trouve.lien,
        inscrits: trouve.inscrits,
      })
    }

    lignes
      .get(`${programmation.annee}-${programmation.mois}`)
      ?.get(categorie)
      ?.push({ titre, heures, lieu, jours, liens })
  }

  const classeur = new ExcelJS.Workbook()
  classeur.creator = 'ETU Bénin'
  classeur.created = new Date()

  const nomFeuille = (base: string) => {
    const propre = base.replace(/[\\/*?:[\]]/g, ' ').slice(0, 31)
    let candidat = propre
    let suffixe = 2
    while (classeur.getWorksheet(candidat)) {
      candidat = `${propre.slice(0, 28)} ${suffixe}`
      suffixe += 1
    }
    return candidat
  }

  const preparer = (nom: string, nombreJours: number) => {
    const feuille = classeur.addWorksheet(nomFeuille(nom), {
      pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
      views: [{ state: 'frozen', xSplit: 4 }],
    })
    largeurs(feuille, nombreJours)
    return feuille
  }

  const pourMois = (annee: number, mois: number, categorie: Categorie) =>
    lignes.get(`${annee}-${mois}`)?.get(categorie) ?? []

  const logo = await lireLogo()
  const logoId = logo ? classeur.addImage({ buffer: logo as unknown as ExcelJS.Buffer, extension: 'png' }) : undefined

  if (fusion || categories.length === 1) {
    // Une feuille par mois : les programmes demandés y sont empilés.
    for (const { annee, mois } of periodes) {
      const nombreJours = new Date(annee, mois, 0).getDate()
      const feuille = preparer(`${MOIS[mois - 1]} ${annee}`, nombreJours)
      let ligne = ecrireEnteteFeuille(feuille, `${MOIS[mois - 1]} ${annee}`, 4 + nombreJours, logoId)
      for (const categorie of categories) {
        ligne = ecrireProgramme(
          feuille,
          categorie,
          annee,
          mois,
          pourMois(annee, mois, categorie),
          ligne,
          IDENTITE[categorie].titre,
        )
      }
    }
  } else {
    // Une feuille par programme : les mois y sont empilés.
    const joursMax = Math.max(...periodes.map(({ annee, mois }) => new Date(annee, mois, 0).getDate()))
    const premier = periodes[0]
    const dernier = periodes[periodes.length - 1]
    const periodeLabel =
      periodes.length === 1
        ? `${MOIS[premier.mois - 1]} ${premier.annee}`
        : `${MOIS[premier.mois - 1]} ${premier.annee} — ${MOIS[dernier.mois - 1]} ${dernier.annee}`

    for (const categorie of categories) {
      const feuille = preparer(categorie === 'TEMPLE' ? 'Temple' : 'École', joursMax)
      let ligne = ecrireEnteteFeuille(
        feuille,
        `${IDENTITE[categorie].titre} · ${periodeLabel}`,
        4 + joursMax,
        logoId,
      )
      for (const { annee, mois } of periodes) {
        ligne = ecrireProgramme(
          feuille,
          categorie,
          annee,
          mois,
          pourMois(annee, mois, categorie),
          ligne,
          `${MOIS[mois - 1]} ${annee}`,
        )
      }
    }
  }

  if (avecLiens) ecrireFeuilleLiens(classeur, seances)

  const contenu = await classeur.xlsx.writeBuffer()
  const suffixeCategorie = categories.length === 1 ? `-${categories[0].toLowerCase()}` : ''
  const premier = `${debut.annee}-${pad(debut.mois)}`
  const dernier = `${fin.annee}-${pad(fin.mois)}`
  const periodeNom = premier === dernier ? premier : `${premier}_${dernier}`
  const nomFichier = `programme${suffixeCategorie}-${periodeNom}.xlsx`

  return new NextResponse(contenu as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${nomFichier}"`,
      'Cache-Control': 'no-store',
    },
  })
}
