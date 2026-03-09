import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = request.cookies.get('admin-session')?.value
    if (adminSession !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    const inscrits = await db.inscriptionTraversee.findMany({
      where: { traverseeId: id },
      include: {
        membre: {
          select: {
            id: true,
            nom: true,
            prenoms: true,
            nomSacre: true,
            grade: true,
            telephoneWhatsapp: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ success: true, data: inscrits })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
