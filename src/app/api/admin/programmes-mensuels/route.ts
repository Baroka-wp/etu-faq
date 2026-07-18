import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { formatAppDateYMD, parseAppDatetimeLocal } from '@/lib/datetime'
import { slugify } from '@/lib/utils'
import { getAuthorizedAdmin } from '@/lib/security/admin'

const CATEGORIES = ['TEMPLE', 'ECOLE'] as const
type Categorie = (typeof CATEGORIES)[number]

const ACTIVITES_PAR_DEFAUT = [
  { categorie: 'TEMPLE', titre: 'Initiation degré Constructeur', heures: '9h-12h', lieu: 'Temple', ordre: 1 },
  { categorie: 'TEMPLE', titre: 'Consécration des Membres du Bureau Exécutif', heures: '9h-12h', lieu: 'Temple', ordre: 2 },
  { categorie: 'TEMPLE', titre: 'Traversée degré Constructeur', heures: '9h-12h', lieu: 'Temple', ordre: 3 },
  { categorie: 'TEMPLE', titre: 'Traversée degré Navigateur', heures: '9h-12h', lieu: 'Temple', ordre: 4 },
  { categorie: 'TEMPLE', titre: 'Traversée initiation Explorateur', heures: 'À préciser', lieu: 'Temple', ordre: 5 },
  { categorie: 'TEMPLE', titre: 'Traversée ISALEM', heures: '9h-15h', lieu: 'Temple', ordre: 6 },
  { categorie: 'ECOLE', titre: "Travaux d'expansion de l'Égrégore d'ETU", heures: '19h-21h', lieu: 'École', ordre: 1 },
  { categorie: 'ECOLE', titre: 'Cours de Philosophie Ésotérique', heures: '19h-21h', lieu: 'École', ordre: 2 },
  { categorie: 'ECOLE', titre: "Cours d'Évangiles Constructeurs", heures: '19h-21h', lieu: 'École', ordre: 3 },
  { categorie: 'ECOLE', titre: "Cours d'Évangiles Navigateurs", heures: '19h-21h', lieu: 'École', ordre: 4 },
  { categorie: 'ECOLE', titre: 'Instruction de Grade Constructeurs', heures: '19h-21h', lieu: 'École', ordre: 5 },
  { categorie: 'ECOLE', titre: 'Instruction de Grade Navigateurs', heures: '19h-21h', lieu: 'École', ordre: 6 },
  { categorie: 'ECOLE', titre: 'Instruction des Explorateurs', heures: '19h-21h', lieu: 'École', ordre: 7 },
  { categorie: 'ECOLE', titre: "Cours d'Explorateurs en ligne", heures: '21h-23h', lieu: 'En ligne', ordre: 8 },
] as const

const TOUS_LES_GRADES = ['Explorateur', 'Constructeur', 'Navigateur', 'Alchimiste']

async function isAdmin(request: NextRequest) {
  return Boolean(await getAuthorizedAdmin(request))
}

function moisValide(annee: number, mois: number) {
  return Number.isInteger(annee) && annee >= 2020 && annee <= 2100 && Number.isInteger(mois) && mois >= 1 && mois <= 12
}

function categorieValide(value: unknown): value is Categorie {
  return typeof value === 'string' && CATEGORIES.includes(value as Categorie)
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function heureDebut(heures: string) {
  const match = heures.match(/(\d{1,2})h(?:(\d{2}))?/i)
  return match ? `${pad(Number(match[1]))}:${match[2] ?? '00'}` : '12:00'
}

async function initialiserCatalogue() {
  if (await db.activiteProgramme.count() > 0) return
  await db.$transaction(ACTIVITES_PAR_DEFAUT.map((activite) => db.activiteProgramme.create({ data: activite })))
}

async function slugDisponible(base: string) {
  let candidat = base
  let suffixe = 2
  while (await db.traversee.findUnique({ where: { lienUnique: candidat }, select: { id: true } })) {
    candidat = `${base}-${suffixe++}`
  }
  return candidat
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const annee = Number(request.nextUrl.searchParams.get('annee'))
  const mois = Number(request.nextUrl.searchParams.get('mois'))
  if (!moisValide(annee, mois)) return NextResponse.json({ error: 'Mois ou année invalide' }, { status: 400 })

  try {
    await initialiserCatalogue()
    const debut = parseAppDatetimeLocal(`${annee}-${pad(mois)}-01T00:00`)
    const prochainMois = mois === 12 ? { annee: annee + 1, mois: 1 } : { annee, mois: mois + 1 }
    const fin = parseAppDatetimeLocal(`${prochainMois.annee}-${pad(prochainMois.mois)}-01T00:00`)

    const activites = await db.activiteProgramme.findMany({
      where: { actif: true },
      orderBy: [{ categorie: 'desc' }, { ordre: 'asc' }, { createdAt: 'asc' }],
      include: {
        programmations: { where: { annee, mois }, select: { jours: true } },
        evenements: {
          where: { date: { gte: debut, lt: fin } },
          select: {
            id: true,
            date: true,
            lienUnique: true,
            gradesAutorises: true,
            _count: { select: { inscriptions: true } },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: activites.map(({ programmations, evenements, ...activite }) => ({
        ...activite,
        jours: programmations[0]?.jours ?? [],
        evenements: evenements.map((evenement) => ({
          id: evenement.id,
          jour: Number(formatAppDateYMD(evenement.date).slice(-2)),
          lienUnique: evenement.lienUnique,
          gradesAutorises: evenement.gradesAutorises,
          inscrits: evenement._count.inscriptions,
        })),
      })),
    })
  } catch (error) {
    console.error('GET /api/admin/programmes-mensuels:', error)
    return NextResponse.json({ error: 'Impossible de charger le programme mensuel' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await request.json()

    if (body.action === 'creer-lien') {
      const activiteId = typeof body.activiteId === 'string' ? body.activiteId : ''
      const annee = Number(body.annee)
      const mois = Number(body.mois)
      const jour = Number(body.jour)
      const maxJour = new Date(annee, mois, 0).getDate()
      if (!activiteId || !moisValide(annee, mois) || !Number.isInteger(jour) || jour < 1 || jour > maxJour) {
        return NextResponse.json({ error: 'Date ou activité invalide' }, { status: 400 })
      }

      const activite = await db.activiteProgramme.findUnique({ where: { id: activiteId } })
      if (!activite || !activite.actif) return NextResponse.json({ error: 'Activité introuvable' }, { status: 404 })

      const dateYmd = `${annee}-${pad(mois)}-${pad(jour)}`
      const debutJour = parseAppDatetimeLocal(`${dateYmd}T00:00`)
      const finJour = parseAppDatetimeLocal(`${dateYmd}T23:59`)
      const existant = await db.traversee.findFirst({
        where: { activiteProgrammeId: activiteId, date: { gte: debutJour, lte: finJour } },
        include: { _count: { select: { inscriptions: true } } },
      })
      if (existant) return NextResponse.json({ success: true, data: existant })

      const baseSlug = `${slugify(activite.titre)}-${dateYmd}`
      const lienUnique = await slugDisponible(baseSlug)
      const grades = Array.isArray(body.gradesAutorises) && body.gradesAutorises.length > 0
        ? body.gradesAutorises.filter((grade: unknown) => typeof grade === 'string' && TOUS_LES_GRADES.includes(grade))
        : TOUS_LES_GRADES

      const evenement = await db.traversee.create({
        data: {
          type: activite.categorie === 'TEMPLE' ? 'Programme du Temple' : 'Programme pédagogique',
          titre: activite.titre,
          description: `${activite.titre} · ${activite.heures}`,
          date: parseAppDatetimeLocal(`${dateYmd}T${heureDebut(activite.heures)}`),
          lieu: activite.lieu,
          lienUnique,
          gradesAutorises: grades.length > 0 ? grades : TOUS_LES_GRADES,
          activiteProgrammeId: activite.id,
        },
        include: { _count: { select: { inscriptions: true } } },
      })

      return NextResponse.json({ success: true, data: evenement }, { status: 201 })
    }

    const categorie = body.categorie
    const titre = typeof body.titre === 'string' ? body.titre.trim() : ''
    const heures = typeof body.heures === 'string' ? body.heures.trim() : ''
    const lieu = typeof body.lieu === 'string' ? body.lieu.trim() : ''
    if (!categorieValide(categorie) || !titre || !heures || !lieu) {
      return NextResponse.json({ error: 'Catégorie, activité, heures et lieu sont obligatoires' }, { status: 400 })
    }

    const dernier = await db.activiteProgramme.aggregate({ where: { categorie }, _max: { ordre: true } })
    const activite = await db.activiteProgramme.create({
      data: { categorie, titre, heures, lieu, ordre: (dernier._max.ordre ?? 0) + 1 },
    })
    return NextResponse.json({ success: true, data: { ...activite, jours: [], evenements: [] } }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/programmes-mensuels:', error)
    return NextResponse.json({ error: "L'opération n'a pas pu être effectuée" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await request.json()
    const annee = Number(body.annee)
    const mois = Number(body.mois)
    const programmations = Array.isArray(body.programmations) ? body.programmations : []
    if (!moisValide(annee, mois)) return NextResponse.json({ error: 'Mois ou année invalide' }, { status: 400 })

    const maxJour = new Date(annee, mois, 0).getDate()
    await db.$transaction(programmations.map((item: { activiteId?: unknown; jours?: unknown }) => {
      const activiteId = typeof item.activiteId === 'string' ? item.activiteId : ''
      const jours = Array.isArray(item.jours)
        ? [...new Set(item.jours.map(Number).filter((jour) => Number.isInteger(jour) && jour >= 1 && jour <= maxJour))].sort((a, b) => a - b)
        : []
      return db.programmationMensuelle.upsert({
        where: { activiteId_annee_mois: { activiteId, annee, mois } },
        update: { jours },
        create: { activiteId, annee, mois, jours },
      })
    }))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/admin/programmes-mensuels:', error)
    return NextResponse.json({ error: "Impossible d'enregistrer le programme" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const evenementId = request.nextUrl.searchParams.get('evenementId')
  const activiteId = request.nextUrl.searchParams.get('activiteId')
  try {
    if (evenementId) {
      await db.traversee.delete({ where: { id: evenementId } })
      return NextResponse.json({ success: true })
    }
    if (activiteId) {
      const liensActifs = await db.traversee.count({ where: { activiteProgrammeId: activiteId } })
      if (liensActifs > 0) {
        return NextResponse.json({ error: "Supprimez d'abord les liens d'inscription associés à cette activité" }, { status: 409 })
      }
      await db.activiteProgramme.update({ where: { id: activiteId }, data: { actif: false } })
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Élément manquant' }, { status: 400 })
  } catch (error) {
    console.error('DELETE /api/admin/programmes-mensuels:', error)
    return NextResponse.json({ error: 'Suppression impossible' }, { status: 500 })
  }
}
