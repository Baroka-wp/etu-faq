import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  generateOccurrences,
  validateRecurrence,
  formatYMD,
  type RecurrenceRule,
} from '@/lib/recurrence'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const adminSession = request.cookies.get('admin-session')?.value
    if (adminSession !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const traversees = await db.traversee.findMany({
      orderBy: { date: 'desc' },
      include: {
        _count: { select: { inscriptions: true } }
      }
    })

    return NextResponse.json({ success: true, data: traversees })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminSession = request.cookies.get('admin-session')?.value
    if (adminSession !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { type, titre, description, date, lieu, lienUnique, gradesAutorises } = body
    const recurrence: RecurrenceRule | undefined = body.recurrence

    if (!titre || !description || !date || !lieu || !lienUnique) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires' }, { status: 400 })
    }

    if (!/^[a-z0-9-]+$/.test(lienUnique)) {
      return NextResponse.json(
        { error: 'Le lien unique ne doit contenir que des lettres minuscules, chiffres et tirets' },
        { status: 400 }
      )
    }

    const grades = Array.isArray(gradesAutorises) && gradesAutorises.length > 0
      ? gradesAutorises
      : ['Explorateur', 'Constructeur', 'Navigateur', 'Alchimiste']

    const startDate = new Date(date)

    // ── Cas simple : pas de récurrence ────────────────────────────────────
    if (!recurrence) {
      const traversee = await db.traversee.create({
        data: {
          type: type || 'Traversée Grand Navire',
          titre,
          description,
          date: startDate,
          lieu,
          lienUnique,
          gradesAutorises: grades,
        },
        include: { _count: { select: { inscriptions: true } } },
      })
      return NextResponse.json({ success: true, data: traversee, created: 1 })
    }

    // ── Cas récurrent : génération des occurrences ────────────────────────
    const validation = validateRecurrence(recurrence, startDate)
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error || 'Règle de récurrence invalide' }, { status: 400 })
    }

    const occurrences = generateOccurrences(recurrence, startDate)
    if (occurrences.length === 0) {
      return NextResponse.json({ error: "Aucune occurrence générée. Vérifie la règle." }, { status: 400 })
    }

    const slugs = occurrences.map(d => `${lienUnique}-${formatYMD(d)}`)
    const existing = await db.traversee.findMany({
      where: { lienUnique: { in: slugs } },
      select: { lienUnique: true },
    })
    if (existing.length > 0) {
      return NextResponse.json(
        {
          error: `Conflit de lien unique sur ${existing.length} occurrence(s). Modifie la base du slug.`,
          conflicts: existing.map(e => e.lienUnique),
        },
        { status: 409 }
      )
    }

    const serieId = randomUUID()
    const records = occurrences.map((d, i) => ({
      type: type || 'Traversée Grand Navire',
      titre,
      description,
      date: d,
      lieu,
      lienUnique: slugs[i],
      gradesAutorises: grades,
      serieId,
    }))

    await db.traversee.createMany({ data: records })

    return NextResponse.json({
      success: true,
      created: records.length,
      serieId,
    })
  } catch (error: unknown) {
    console.error('POST /api/admin/traversees:', error)

    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Ce lien unique est déjà utilisé. Veuillez en choisir un autre.' }, { status: 409 })
      }
      if (error.code === 'P2022') {
        return NextResponse.json(
          { error: 'Schéma base de données obsolète. Exécutez : npx prisma db push' },
          { status: 500 }
        )
      }
    }

    const details = error instanceof Error ? error.message : undefined
    const staleClient = details?.includes('Unknown argument `serieId`')
    return NextResponse.json(
      {
        error: staleClient
          ? 'Client Prisma obsolète. Arrête le serveur, exécute « npx prisma generate », puis relance « npm run dev ».'
          : 'Erreur serveur',
        ...(process.env.NODE_ENV === 'development' && details && !staleClient ? { details } : {}),
      },
      { status: 500 }
    )
  }
}
