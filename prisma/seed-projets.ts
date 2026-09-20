/**
 * Charge les quatre grands projets confiés au comité de suivi.
 * Idempotent : un projet déjà présent (même titre) n'est pas dupliqué.
 *
 *   npx tsx prisma/seed-projets.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PROJETS: Array<{
  titre: string
  resume: string
  description?: string
  taches: string[]
}> = [
  {
    titre: 'Les 50 ans de l’Ordre',
    resume:
      'Achever la construction du temple et son embellissement avant la célébration.',
    description:
      'C’est le plus gros du morceau : avant la célébration elle-même, nous projetons d’achever la construction du temple et d’en assurer l’embellissement.',
    taches: [
      'Retrouver le plan de construction initial',
      'Mettre à jour le plan de construction',
      'Faire réaliser une maquette 3D par des architectes ou des ingénieurs en génie civil',
      'Mobiliser les fonds auprès des membres ETU (Côte d’Ivoire, Burkina, Bénin…) et de l’extérieur',
      'Préparer la célébration : invitations, hébergement, déplacements, festivités',
    ],
  },
  {
    titre: 'Décoration temporaire du temple',
    resume: 'Vêtir les murs nus en attendant la décoration définitive.',
    description:
      'Les murs du temple sont nus, sans ornementation. Nous disposons de tableaux et de bannières simples, de voiles, de cordes de pêcheur — des installations qui ne seront pas trop difficiles à retirer le moment venu.',
    taches: [
      'Réaliser les éléments graphiques et les imprimer',
      'Réfléchir aux décorations supplémentaires minimales',
      'Réaliser un tableau constructeur de plus petite taille',
      'Accrocher ou disposer correctement les tableaux de Caïn et Abel',
      'Poser le pavé mosaïque',
      'Aménager les vestiaires et le hall, et établir un plan d’entretien du temple impliquant tout le monde',
      'Apporter de la beauté à la cour et à l’entrée du temple',
    ],
  },
  {
    titre: 'Organiser et dynamiser les activités caritatives d’ETU',
    resume: 'Faire de la charité une activité continue plutôt que ponctuelle.',
    description:
      'La clef de la charité ne devrait jamais rouiller à ETU faute de servir régulièrement. Venir en aide aux orphelins, aux personnes hospitalisées, aux enfants à qui manque le peu nécessaire pour s’instruire.',
    taches: [
      'Créer les caisses de solidarité (pas seulement pour les membres ETU)',
      'Aller vers les bonnes volontés (pas seulement les membres ETU)',
      'Organiser et promouvoir nos actions',
    ],
  },
  {
    titre: 'Les enseignements et la transmission',
    resume: 'Rendre les enseignements d’ETU accessibles aux membres et à la société.',
    description:
      'Nous devons être non seulement des porteurs, mais aussi des révélateurs de lumière spirituelle.',
    taches: [
      'Vulgariser les enseignements sans les désacraliser, par des séminaires par exemple',
      'Créer un dictionnaire philosophique du transcendantaliste (d’abord à l’usage des membres)',
    ],
  },
]

async function main() {
  let crees = 0

  for (const [index, definition] of PROJETS.entries()) {
    const existant = await prisma.projet.findFirst({ where: { titre: definition.titre } })
    if (existant) {
      console.log(`· déjà présent : ${definition.titre}`)
      continue
    }

    await prisma.projet.create({
      data: {
        titre: definition.titre,
        resume: definition.resume,
        description: definition.description,
        statut: 'en_cours',
        ordre: index + 1,
        taches: {
          create: definition.taches.map((titre, position) => ({
            titre,
            ordre: position + 1,
          })),
        },
      },
    })
    crees += 1
    console.log(`✓ ${definition.titre} (${definition.taches.length} tâches)`)
  }

  console.log(`\n${crees} projet(s) créé(s).`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
