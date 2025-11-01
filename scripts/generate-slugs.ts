import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Fonction pour créer un slug SEO-friendly à partir d'un titre
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Remplacer les caractères accentués
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remplacer les espaces et caractères spéciaux par des tirets
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

async function generateSlugs() {
  try {
    console.log('🔍 Recherche des livres sans slug...')

    // Récupérer tous les livres
    const books = await prisma.book.findMany({
      where: {
        OR: [
          { slug: null },
          { slug: '' }
        ]
      }
    })

    console.log(`📚 ${books.length} livre(s) trouvé(s) sans slug`)

    if (books.length === 0) {
      console.log('✅ Tous les livres ont déjà un slug')
      return
    }

    // Générer et assigner les slugs
    for (const book of books) {
      let slug = slugify(book.title)
      let counter = 1
      let finalSlug = slug

      // Vérifier l'unicité du slug
      while (true) {
        const existing = await prisma.book.findUnique({
          where: { slug: finalSlug }
        })

        if (!existing) {
          break
        }

        finalSlug = `${slug}-${counter}`
        counter++
      }

      // Mettre à jour le livre avec le slug
      await prisma.book.update({
        where: { id: book.id },
        data: { slug: finalSlug }
      })

      console.log(`✓ "${book.title}" → /${finalSlug}`)
    }

    console.log(`\n🎉 ${books.length} slug(s) généré(s) avec succès!`)
  } catch (error) {
    console.error('❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

generateSlugs()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
