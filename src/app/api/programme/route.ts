import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PROGRAMME_PERIODS, type ProgrammePeriod } from '@/lib/programme'

function dateFilter(period: ProgrammePeriod) {
  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  switch (period) {
    case 'upcoming':
      return { date: { gte: now } }
    case 'thisMonth':
      return { date: { gte: startOfThisMonth, lte: endOfThisMonth } }
    case 'lastMonth':
      return { date: { gte: startOfLastMonth, lte: endOfLastMonth } }
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
