/**
 * Script pour créer les événements du planning Avril 2026 (ETU)
 * Exécuter avec: npx tsx scripts/create-planning-avril-2026.ts
 */

const BASE_URL = 'http://localhost:3000'

interface Evenement {
  type: string
  titre: string
  description: string
  date: string // ISO format
  lieu: string
  lienUnique: string
  gradesAutorises: string[]
}

// ⚠️ INSTRUCTIONS : Dupliquez les blocs ci-dessous pour chaque occurrence de l'événement dans le mois.
// Remplacez les "XX" dans la date et le lienUnique par le jour exact du mois (ex: "04", "15", "22").

const evenements: Evenement[] = [
  // 1. Traversée degré Constructeur - 17 avril
  {
    type: 'Traversée',
    titre: 'Traversée degré Constructeur',
    description: 'Travaux en temple pour le degré Constructeur.',
    date: '2026-04-17T09:00:00.000Z',
    lieu: 'Temple',
    lienUnique: 'traversee-constructeur-17-avril-2026',
    gradesAutorises: ['Constructeur']
  },

  // 2. Traversée degré Navigateur - 24 avril
  {
    type: 'Traversée',
    titre: 'Traversée degré Navigateur',
    description: 'Travaux en temple pour le degré Navigateur.',
    date: '2026-04-24T09:00:00.000Z',
    lieu: 'Temple',
    lienUnique: 'traversee-navigateur-24-avril-2026',
    gradesAutorises: ['Navigateur']
  },

  // 3. Cours de Philosophie Ésotérique - 7 avril
  {
    type: 'Cours',
    titre: 'Cours de Philosophie Ésotérique',
    description: 'Étude animée par Très Illustre Métatron UVAYEL et Très Illustre Métatron UZAIEL.',
    date: '2026-04-07T19:00:00.000Z',
    lieu: 'École',
    lienUnique: 'cours-philosophie-07-avril-2026',
    gradesAutorises: ['Explorateur', 'Constructeur', 'Navigateur', 'Alchimiste']
  },

  // 3. Cours de Philosophie Ésotérique - 14 avril
  {
    type: 'Cours',
    titre: 'Cours de Philosophie Ésotérique',
    description: 'Étude animée par Très Illustre Métatron UVAYEL et Très Illustre Métatron UZAIEL.',
    date: '2026-04-14T19:00:00.000Z',
    lieu: 'École',
    lienUnique: 'cours-philosophie-14-avril-2026',
    gradesAutorises: ['Explorateur', 'Constructeur', 'Navigateur', 'Alchimiste']
  },

  // 3. Cours de Philosophie Ésotérique - 21 avril
  {
    type: 'Cours',
    titre: 'Cours de Philosophie Ésotérique',
    description: 'Étude animée par Très Illustre Métatron UVAYEL et Très Illustre Métatron UZAIEL.',
    date: '2026-04-21T19:00:00.000Z',
    lieu: 'École',
    lienUnique: 'cours-philosophie-21-avril-2026',
    gradesAutorises: ['Explorateur', 'Constructeur', 'Navigateur', 'Alchimiste']
  },

  // 3. Cours de Philosophie Ésotérique - 28 avril
  {
    type: 'Cours',
    titre: 'Cours de Philosophie Ésotérique',
    description: 'Étude animée par Très Illustre Métatron UVAYEL et Très Illustre Métatron UZAIEL.',
    date: '2026-04-28T19:00:00.000Z',
    lieu: 'École',
    lienUnique: 'cours-philosophie-28-avril-2026',
    gradesAutorises: ['Explorateur', 'Constructeur', 'Navigateur', 'Alchimiste']
  },

  // 4. Cours d'Évangiles Constructeurs - 5 avril
  {
    type: 'Cours',
    titre: "Cours d'Évangiles Constructeurs",
    description: 'Animé par Resp. Kéther AYKASHEL et Resp. Kéther LAHERIEL.',
    date: '2026-04-05T19:00:00.000Z',
    lieu: 'École',
    lienUnique: 'evangiles-constructeurs-05-avril-2026',
    gradesAutorises: ['Constructeur']
  },

  // 4. Cours d'Évangiles Constructeurs - 21 avril
  {
    type: 'Cours',
    titre: "Cours d'Évangiles Constructeurs",
    description: 'Animé par Resp. Kéther AYKASHEL et Resp. Kéther LAHERIEL.',
    date: '2026-04-21T19:00:00.000Z',
    lieu: 'École',
    lienUnique: 'evangiles-constructeurs-21-avril-2026',
    gradesAutorises: ['Constructeur']
  },

  // 5. Cours d'Évangiles Navigateurs - 12 avril
  {
    type: 'Cours',
    titre: "Cours d'Évangiles Navigateurs",
    description: 'Animé par Passé T.I. Métatron CHAIDALAH et Passé T.I. Métatron METROS.',
    date: '2026-04-12T19:00:00.000Z',
    lieu: 'École',
    lienUnique: 'evangiles-navigateurs-12-avril-2026',
    gradesAutorises: ['Navigateur']
  },

  // 5. Cours d'Évangiles Navigateurs - 26 avril
  {
    type: 'Cours',
    titre: "Cours d'Évangiles Navigateurs",
    description: 'Animé par Passé T.I. Métatron CHAIDALAH et Passé T.I. Métatron METROS.',
    date: '2026-04-26T19:00:00.000Z',
    lieu: 'École',
    lienUnique: 'evangiles-navigateurs-26-avril-2026',
    gradesAutorises: ['Navigateur']
  },

  // 6. Instruction de Grade Constructeurs - 14 avril
  {
    type: 'Instruction',
    titre: 'Instruction de Grade Constructeurs',
    description: 'Instruction spécifique animée par les Très Illustres Métatrons (MEIKIEL, UVAYEL, UZAIEL).',
    date: '2026-04-14T19:00:00.000Z',
    lieu: 'École',
    lienUnique: 'instruction-constructeurs-14-avril-2026',
    gradesAutorises: ['Constructeur']
  },

  // 7. Instruction de Grade Navigateurs - 9 avril
  {
    type: 'Instruction',
    titre: 'Instruction de Grade Navigateurs',
    description: 'Instruction spécifique animée par les Très Illustres Métatrons (MEIKIEL, UVAYEL, UZAIEL).',
    date: '2026-04-09T19:00:00.000Z',
    lieu: 'École',
    lienUnique: 'instruction-navigateurs-09-avril-2026',
    gradesAutorises: ['Navigateur']
  },

  // 8. Cours d'initiation à la Kabbale Explorateurs - 2 avril
  {
    type: 'Cours',
    titre: "Cours d'initiation à la Kabbale",
    description: 'Initiation à la Kabbale animée par le Respectable Kéther ALBIMAEL.',
    date: '2026-04-02T21:00:00.000Z',
    lieu: 'En ligne',
    lienUnique: 'initiation-kabbale-02-avril-2026',
    gradesAutorises: ['Explorateur']
  },

  // 8. Cours d'initiation à la Kabbale Explorateurs - 4 avril
  {
    type: 'Cours',
    titre: "Cours d'initiation à la Kabbale",
    description: 'Initiation à la Kabbale animée par le Respectable Kéther ALBIMAEL.',
    date: '2026-04-04T21:00:00.000Z',
    lieu: 'En ligne',
    lienUnique: 'initiation-kabbale-04-avril-2026',
    gradesAutorises: ['Explorateur']
  },

  // 8. Cours d'initiation à la Kabbale Explorateurs - 9 avril
  {
    type: 'Cours',
    titre: "Cours d'initiation à la Kabbale",
    description: 'Initiation à la Kabbale animée par le Respectable Kéther ALBIMAEL.',
    date: '2026-04-09T21:00:00.000Z',
    lieu: 'En ligne',
    lienUnique: 'initiation-kabbale-09-avril-2026',
    gradesAutorises: ['Explorateur']
  },

  // 8. Cours d'initiation à la Kabbale Explorateurs - 11 avril
  {
    type: 'Cours',
    titre: "Cours d'initiation à la Kabbale",
    description: 'Initiation à la Kabbale animée par le Respectable Kéther ALBIMAEL.',
    date: '2026-04-11T21:00:00.000Z',
    lieu: 'En ligne',
    lienUnique: 'initiation-kabbale-11-avril-2026',
    gradesAutorises: ['Explorateur']
  },

  // 8. Cours d'initiation à la Kabbale Explorateurs - 16 avril
  {
    type: 'Cours',
    titre: "Cours d'initiation à la Kabbale",
    description: 'Initiation à la Kabbale animée par le Respectable Kéther ALBIMAEL.',
    date: '2026-04-16T21:00:00.000Z',
    lieu: 'En ligne',
    lienUnique: 'initiation-kabbale-16-avril-2026',
    gradesAutorises: ['Explorateur']
  },

  // 8. Cours d'initiation à la Kabbale Explorateurs - 18 avril
  {
    type: 'Cours',
    titre: "Cours d'initiation à la Kabbale",
    description: 'Initiation à la Kabbale animée par le Respectable Kéther ALBIMAEL.',
    date: '2026-04-18T21:00:00.000Z',
    lieu: 'En ligne',
    lienUnique: 'initiation-kabbale-18-avril-2026',
    gradesAutorises: ['Explorateur']
  },

  // 8. Cours d'initiation à la Kabbale Explorateurs - 23 avril
  {
    type: 'Cours',
    titre: "Cours d'initiation à la Kabbale",
    description: 'Initiation à la Kabbale animée par le Respectable Kéther ALBIMAEL.',
    date: '2026-04-23T21:00:00.000Z',
    lieu: 'En ligne',
    lienUnique: 'initiation-kabbale-23-avril-2026',
    gradesAutorises: ['Explorateur']
  },

  // 8. Cours d'initiation à la Kabbale Explorateurs - 25 avril
  {
    type: 'Cours',
    titre: "Cours d'initiation à la Kabbale",
    description: 'Initiation à la Kabbale animée par le Respectable Kéther ALBIMAEL.',
    date: '2026-04-25T21:00:00.000Z',
    lieu: 'En ligne',
    lienUnique: 'initiation-kabbale-25-avril-2026',
    gradesAutorises: ['Explorateur']
  }
]

async function creerEvenement(evenement: Evenement, cookie: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/traversees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `admin-session=${cookie}`
      },
      body: JSON.stringify(evenement)
    })

    const data = await res.json()

    if (res.ok) {
      console.log(`✅ ${evenement.titre} - ${new Date(evenement.date).toLocaleDateString('fr-FR')}`)
      return true
    } else {
      console.error(`❌ ${evenement.titre}: ${data.error}`)
      return false
    }
  } catch (error) {
    console.error(`❌ ${evenement.titre}: Erreur réseau`, error)
    return false
  }
}

async function main() {
  console.log('🚀 Création du planning ETU Avril 2026...')
  console.log(`📅 ${evenements.length} événements à créer`)
  console.log('')

  console.log('🔐 Connexion admin...')
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: process.env.ADMIN_PASSWORD || 'etu2024' })
  })

  if (!loginRes.ok) {
    console.error('❌ Échec de connexion admin. Vérifiez les identifiants.')
    process.exit(1)
  }

  const setCookie = loginRes.headers.get('set-cookie')
  if (!setCookie) {
    console.error('❌ Pas de cookie admin reçu')
    process.exit(1)
  }

  const cookieMatch = setCookie.match(/admin-session=([^;]+)/)
  if (!cookieMatch) {
    console.error('❌ Impossible d\'extraire le cookie admin')
    process.exit(1)
  }
  const cookie = cookieMatch[1]
  console.log('✅ Connecté en tant qu\'admin')
  console.log('')

  let success = 0
  let errors = 0

  for (const evenement of evenements) {
    // Sécurité: vérifier que les dates ont été remplies
    if (evenement.date.includes('XX')) {
      console.error(`⚠️ Ignoré: La date n'a pas été renseignée pour "${evenement.titre}"`)
      errors++
      continue
    }

    const ok = await creerEvenement(evenement, cookie)
    if (ok) {
      success++
    } else {
      errors++
    }
    await new Promise(r => setTimeout(r, 200))
  }

  console.log('')
  console.log('═══════════════════════════════════════')
  console.log(`📊 Résultat: ${success} créés, ${errors} erreurs/ignorés`)
  console.log('═══════════════════════════════════════')
}

main().catch(console.error)