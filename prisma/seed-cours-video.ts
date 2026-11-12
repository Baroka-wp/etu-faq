import { PrismaClient } from '@prisma/client'
import cours from '../src/app/videotheque/cours.json'

const db = new PrismaClient()
const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

async function importerCours() {
  const data = cours.map(seance => {
    const [jour, nomMois, annee] = seance.date.split(' ')
    const numeroMois = mois.indexOf(nomMois) + 1
    if (!numeroMois) throw new Error('Date inconnue : ' + seance.date)
    return {
      id: seance.id, driveId: seance.id,
      date: [annee, String(numeroMois).padStart(2, '0'), jour.padStart(2, '0')].join('-'),
      titre: 'Cours du ' + seance.date,
      presentiel: seance.presentiel,
      notes: seance.notes.join('\n\n'),
    }
  })
  const resultat = await db.coursVideo.createMany({ data, skipDuplicates: true })
  console.log(resultat.count + ' cours importés')
}

importerCours().catch(error => {
  console.error(error)
  process.exitCode = 1
}).finally(() => db.$disconnect())
