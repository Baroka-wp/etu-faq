import { generateUserPassword } from '@/lib/password-generator'
import { lireCredentialDossier, protectCredential } from './credential'
import type { SessionPayload } from './session'

export const validiteCode = 30 * 24 * 60 * 60 * 1000

export async function nouveauCodeAspirant() {
  return {
    codeAspirant: await protectCredential(generateUserPassword()),
    codeExpireLe: new Date(Date.now() + validiteCode),
  }
}

export function sessionAspirantValide(session: SessionPayload | null, dossier: { codeExpireLe: Date | null } | null) {
  const expiration = dossier?.codeExpireLe?.getTime()
  return !!expiration && expiration > Date.now() && session?.credentialExpiry === expiration
}

export async function avecNouveauCode<T>(enregistrer: (code: Awaited<ReturnType<typeof nouveauCodeAspirant>>) => Promise<T>) {
  for (let tentative = 0; ; tentative++) {
    try {
      return await enregistrer(await nouveauCodeAspirant())
    } catch (error) {
      if (tentative >= 4 || !(error && typeof error === 'object' && 'code' in error && error.code === 'P2002')) throw error
    }
  }
}

export async function dossierAdmin<T extends { codeAspirant: string | null; motDePasse: string }>(
  { codeAspirant, motDePasse: _ancien, ...dossier }: T
) {
  return { ...dossier, motDePasse: codeAspirant ? await lireCredentialDossier(codeAspirant) : null }
}
