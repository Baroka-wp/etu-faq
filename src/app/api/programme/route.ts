import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PROGRAMME_PERIODS, type ProgrammePeriod } from '@/lib/programme'
import { appMonthBounds } from '@/lib/datetime'

function dateFilter(period: ProgrammePeriod) {
  const now = new Date()
  const thisMonth = appMonthBounds(now, 0)
  const lastMonth = appMonthBounds(now, -1)

  switch (period) {
    case 'upcoming':
      return { date: { gte: now } }
    case 'thisMonth':
      return { date: { gte: thisMonth.start, lte: thisMonth.end } }
    case 'lastMonth':
      return { date: { gte: lastMonth.start, lte: lastMonth.end } }
    case 'past':
      return { date: { lt: now } }
    default:
      return {}
  }
}

export async function GET(request: NextRequest) {
  try {
    const period = (request.nextUrl.searchParams.get('period') || 'thisMonth') as ProgrammePeriod
    const safePeriod = PROGRAMME_PERIODS.includes(period) ? period : 'thisMonth'

    const evenements = await db.traversee.findMany({
      where: dateFilter(safePeriod),
      orderBy: { date: 'asc' },
      select: {
        id: true,
        type: true,
        titre: true,
        description: true,
        date: true,
        lieu: true,
        lienUnique: true,
        gradesAutorises: true,
        serieId: true,
      },
    })

    return NextResponse.json({ success: true, evenements, period: safePeriod })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
