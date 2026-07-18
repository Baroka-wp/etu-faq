import { NextResponse } from 'next/server'

// La création d'un mot de passe avec le seul nom sacré permettait de prendre le
// contrôle d'un compte. Les mots de passe initiaux sont désormais définis par
// l'administrateur via la route protégée de réinitialisation.
export async function POST() {
  return NextResponse.json(
    { error: "Pour sécuriser votre compte, demandez un mot de passe initial à l'administrateur." },
    { status: 403 }
  )
}
