import { db } from '@/lib/db'

const INVISIBLE_CHARACTERS = /[\u200B-\u200D\u2060\uFEFF]/g
const DIACRITICS = /[\u0300-\u036f]/g

export function cleanSacredNameForStorage(value: unknown): string | null {
  if (typeof value !== 'string') return null

  const cleaned = value
    .replace(INVISIBLE_CHARACTERS, '')
    .trim()
    .replace(/\s+/g, ' ')

  return cleaned.length > 0 ? cleaned : null
}

export function normalizeSacredName(value: string): string {
  const cleaned = cleanSacredNameForStorage(value)
  if (!cleaned) return ''

  return cleaned
    .normalize('NFKD')
    .replace(DIACRITICS, '')
    .toLocaleLowerCase('fr')
}

export async function findActiveMemberBySacredName(value: string) {
  const normalizedName = normalizeSacredName(value)
  if (!normalizedName) return null

  const activeMembers = await db.membre.findMany({
    where: {
      statut: 'actif',
      nomSacre: { not: null },
    },
    select: { id: true, nomSacre: true },
  })

  return activeMembers.find(
    (member) => member.nomSacre && normalizeSacredName(member.nomSacre) === normalizedName
  ) ?? null
}
