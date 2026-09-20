import { db } from '@/lib/db'

/** Retourne la date, null si le champ est vide, 'invalid' si la saisie est illisible. */
export function parseEcheance(value: unknown): Date | null | 'invalid' {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string') return 'invalid'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'invalid' : date
}

/** Vérifie que la personne assignée est bien un membre actif. */
export async function resolveAssigne(value: unknown): Promise<string | null | 'invalid'> {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string') return 'invalid'
  const membre = await db.membre.findFirst({ where: { id: value, statut: 'actif' }, select: { id: true } })
  return membre ? membre.id : 'invalid'
}
