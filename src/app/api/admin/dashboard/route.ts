import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthorizedAdmin } from '@/lib/security/admin'

export async function GET(request: NextRequest) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const [activeMembers, monthEvents, pendingAspirants, books, upcomingEvents] = await Promise.all([
      db.membre.count({ where: { statut: 'actif' } }),
      db.traversee.count({ where: { date: { gte: monthStart, lt: nextMonth } } }),
      db.inscription.count({ where: { statut: 'En attente' } }),
      db.book.count(),
      db.traversee.findMany({
        where: { date: { gte: now } },
        orderBy: { date: 'asc' },
        take: 5,
        select: {
          id: true,
          titre: true,
          date: true,
          lieu: true,
          _count: { select: { inscriptions: true } },
        },
      }),
    ])

    return NextResponse.json({
      activeMembers,
      monthEvents,
      pendingAspirants,
      books,
      upcomingEvents: upcomingEvents.map(({ _count, ...event }) => ({
        ...event,
        inscriptions: _count.inscriptions,
      })),
    })
  } catch {
    return NextResponse.json({ error: 'Chargement du tableau de bord impossible' }, { status: 500 })
  }
}
