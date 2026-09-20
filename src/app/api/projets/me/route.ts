import { NextRequest, NextResponse } from 'next/server'
import { getComiteAccess } from '@/lib/security/comite'

export async function GET(request: NextRequest) {
  const membre = await getComiteAccess(request)
  if (!membre) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  return NextResponse.json({ membre })
}
