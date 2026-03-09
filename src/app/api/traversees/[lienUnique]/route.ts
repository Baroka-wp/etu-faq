import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lienUnique: string }> }
) {
  try {
    const { lienUnique } = await params

    const traversee = await db.traversee.findUnique({
      where: { lienUnique },
      select: {
        id: true,
        type: true,
        titre: true,
        description: true,
        date: true,
        lieu: true,
        lienUnique: true,
        gradesAutorises: true,
        _count: { select: { inscriptions: true } }
      }
    })

    if (!traversee) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: traversee })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
