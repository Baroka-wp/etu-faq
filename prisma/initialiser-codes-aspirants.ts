import { loadEnvConfig } from '@next/env'
import { PrismaClient } from '@prisma/client'
import { avecNouveauCode } from '../src/lib/security/aspirant'

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production')
const db = new PrismaClient()
async function initialiser() {
  const dossiers = await db.inscription.findMany({ where: { codeAspirant: null }, select: { id: true } })
  for (const { id } of dossiers) {
    await avecNouveauCode(data => db.inscription.updateMany({ where: { id, codeAspirant: null }, data }))
  }
  console.log('Dossiers sans code :', await db.inscription.count({ where: { codeAspirant: null } }))
}
initialiser().catch(() => { process.exitCode = 1 }).finally(() => db.$disconnect())
