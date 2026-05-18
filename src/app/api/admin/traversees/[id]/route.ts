import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  formatAppDateYMD,
  getAppHourMinute,
  parseAppDatetimeLocal,
} from '@/lib/datetime'
import { formatYMD } from '@/lib/recurrence'

const SERIES_SLUG_SUFFIX = /-\d{4}-\d{2}-\d{2}$/

function seriesSlugBase(slug: string): string {
  return slug.replace(SERIES_SLUG_SUFFIX, '')
}

function applyAppTimeToDate(occurrenceDate: Date, timeSource: Date): Date {
  const ymd = formatAppDateYMD(occurrenceDate)
  const { hour, minute } = getAppHourMinute(timeSource)
  const h = String(hour).padStart(2, '0')
  const m = String(minute).padStart(2, '0')
  return parseAppDatetimeLocal(`${ymd}T${h}:${m}`)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = request.cookies.get('admin-session')?.value
    if (adminSession !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      type,
      titre,
      description,
      date,
      lieu,
      lienUnique,
      gradesAutorises,
      applyToSeries,
    } = body

    if (!titre || !description || !date || !lieu || !lienUnique) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires' }, { status: 400 })
    }

    if (!/^[a-z0-9-]+$/.test(lienUnique)) {
      return NextResponse.json(
        { error: 'Le lien unique ne doit contenir que des lettres minuscules, chiffres et tirets' },
        { status: 400 }
      )
    }

    const existing = await db.traversee.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Planification non trouvée' }, { status: 404 })
    }

    const grades = Array.isArray(gradesAutorises) && gradesAutorises.length > 0
      ? gradesAutorises
      : ['Explorateur', 'Constructeur', 'Navigateur', 'Alchimiste']

    const parsedDate = parseAppDatetimeLocal(date)
    const shared = {
      type: type || 'Traversée Grand Navire',
      titre,
      description,
      lieu,
      gradesAutorises: grades,
    }

    if (applyToSeries && existing.serieId) {
      const siblings = await db.traversee.findMany({
        where: { serieId: existing.serieId },
        orderBy: { date: 'asc' },
      })

      const baseSlug = seriesSlugBase(lienUnique)
      const updates = siblings.map(s => {
        const occDate = s.id === id ? parsedDate : applyAppTimeToDate(s.date, parsedDate)
        return {
          id: s.id,
          date: occDate,
          lienUnique: `${baseSlug}-${formatYMD(occDate)}`,
        }
      })

      const newSlugs = updates.map(u => u.lienUnique)
      const siblingIds = siblings.map(s => s.id)
      const conflicts = await db.traversee.findMany({
        where: {
          lienUnique: { in: newSlugs },
          id: { notIn: siblingIds },
        },
        select: { lienUnique: true },
      })
      if (conflicts.length > 0) {
        return NextResponse.json(
          { error: `Conflit de lien unique : ${conflicts.map(c => c.lienUnique).join(', ')}` },
          { status: 409 }
        )
      }

      await db.$transaction(
        updates.map(u =>
          db.traversee.update({
            where: { id: u.id },
            data: { ...shared, date: u.date, lienUnique: u.lienUnique },
          })
        )
      )

      const traversee = await db.traversee.findUnique({
        where: { id },
        include: { _count: { select: { inscriptions: true } } },
      })

      return NextResponse.json({
        success: true,
        data: traversee,
        updated: updates.length,
      })
    }

    const traversee = await db.traversee.update({
      where: { id },
      data: { ...shared, date: parsedDate, lienUnique },
      include: { _count: { select: { inscriptions: true } } },
    })

    return NextResponse.json({ success: true, data: traversee, updated: 1 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce lien unique est déjà utilisé.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = request.cookies.get('admin-session')?.value
    if (adminSession !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    const existing = await db.traversee.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Traversée non trouvée' }, { status: 404 })
    }

    await db.traversee.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Traversée supprimée avec succès' })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
