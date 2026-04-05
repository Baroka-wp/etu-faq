const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function initMemberPasswords() {
  try {
    console.log('🔐 Initialisation des mots de passe membres...\n')

    // Récupérer tous les membres sans mot de passe
    const membresWithoutPassword = await prisma.membre.findMany({
      where: {
        OR: [
          { motDePasse: null },
          { motDePasse: '' }
        ]
      },
      select: {
        id: true,
        nom: true,
        prenoms: true,
        nomSacre: true,
        telephoneWhatsapp: true,
        email: true
      }
    })

    console.log(`📊 ${membresWithoutPassword.length} membre(s) sans mot de passe trouvé(s)\n`)

    if (membresWithoutPassword.length === 0) {
      console.log('✅ Tous les membres ont déjà un mot de passe')
      return
    }

    const passwordsList = []

    for (const membre of membresWithoutPassword) {
      // Générer un mot de passe temporaire : ETU + 4 premiers caractères du nom sacré (ou nom) + 2024
      const baseForPassword = (membre.nomSacre || membre.nom).substring(0, 4).toUpperCase()
      const tempPassword = `ETU${baseForPassword}2024`

      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(tempPassword, 10)

      // Mettre à jour le membre
      await prisma.membre.update({
        where: { id: membre.id },
        data: { motDePasse: hashedPassword }
      })

      // Ajouter à la liste pour affichage
      passwordsList.push({
        nom: `${membre.prenoms} ${membre.nom}`,
        nomSacre: membre.nomSacre || 'N/A',
        telephone: membre.telephoneWhatsapp,
        email: membre.email,
        motDePasse: tempPassword
      })
    }

    console.log('✅ Mots de passe initialisés avec succès!\n')
    console.log('='.repeat(80))
    console.log('LISTE DES MOTS DE PASSE TEMPORAIRES À COMMUNIQUER AUX MEMBRES')
    console.log('='.repeat(80))
    console.log('\n⚠️  IMPORTANT : Les membres devront changer leur mot de passe lors de leur première connexion\n')

    passwordsList.forEach((membre, index) => {
      console.log(`${index + 1}. ${membre.nom}`)
      console.log(`   Nom Sacré: ${membre.nomSacre}`)
      console.log(`   Email: ${membre.email}`)
      console.log(`   Téléphone: ${membre.telephone}`)
      console.log(`   Mot de passe temporaire: ${membre.motDePasse}`)
      console.log('-'.repeat(80))
    })

    console.log('\n📝 Suggestions de communication:')
    console.log('1. Envoyer par WhatsApp au numéro de chaque membre')
    console.log('2. Envoyer par email avec lien vers le dashboard')
    console.log('3. Format du message suggéré:')
    console.log(`
Bonjour [Nom Sacré],

Bienvenue sur votre dashboard personnel OMP-ETU Bénin !

🔐 Vos identifiants de connexion:
- Nom Sacré: [Nom Sacré]
- Mot de passe temporaire: [Mot de passe]

🌐 Lien de connexion: https://votre-domaine.com/membre/login

⚠️ Pour votre sécurité, veuillez changer votre mot de passe lors de votre première connexion.

Dans votre dashboard, vous pourrez:
✓ Consulter votre planning personnel
✓ Vous inscrire aux traversées
✓ Voir votre Theme astral
✓ Accéder à la bibliothèque
✓ Modifier vos informations

Fraternellement,
L'équipe OMP-ETU Bénin
    `)

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initMemberPasswords()
