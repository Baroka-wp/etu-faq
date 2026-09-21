/**
 * Verse dans le journal des enseignements le contenu des séances déjà saisies.
 * Idempotent : relancer le script ne crée pas de doublon.
 *
 *   npx tsx prisma/backfill-enseignements.ts
 */
import { db } from '@/lib/db'
import { synchroniserEnseignements } from '@/lib/enseignements'

async function main() {
  const traversees = await db.traversee.findMany({
    where: {
      OR: [{ instruction: { not: null } }, { seminaire: { not: null } }, { sujetPlanche: { not: null } }],
    },
    select: { id: true, titre: true },
  })

  for (const traversee of traversees) {
    await synchroniserEnseignements(traversee.id)
    console.log(`✓ ${traversee.titre}`)
  }

  console.log(`\n${traversees.length} séance(s) reprise(s) ; ${await db.enseignement.count()} thème(s) au journal.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
