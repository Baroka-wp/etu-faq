'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Search, Download, ShoppingCart } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  description: string
  price: number | null
  isFree: boolean
  category: string
  imageUrl: string
  driveUrl: string
  whatsappMessage: string
}

export default function BibliothePageMembre() {
  const [books, setBooks] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/bibliotheque')
      if (response.ok) {
        const data = await response.json()
        setBooks(data.books || [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleDownload = (book: Book) => {
    if (book.driveUrl) {
      window.open(book.driveUrl, '_blank')
    }
  }

  const handleWhatsAppOrder = (book: Book) => {
    const message = book.whatsappMessage || `Bonjour, je souhaite commander le livre "${book.title}" de ${book.author}.`
    window.open(`https://wa.me/22967153974?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (isLoading) {
    return <div className="p-8">Chargement de la bibliothèque...</div>
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Bibliothèque</h1>

      {/* Recherche et filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un livre ou un auteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-serif"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-serif"
          >
            <option value="all">Toutes les catégories</option>
            <option value="etu">Éditions ETU</option>
            <option value="recommended">Lectures recommandées</option>
          </select>
        </div>
      </div>

      {/* Liste des livres */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-serif">Aucun livre trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div key={book.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {book.imageUrl && (
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-lg font-bold font-serif text-gray-900 mb-2">{book.title}</h3>
                <p className="text-sm text-gray-600 font-serif mb-3">{book.author}</p>
                <p className="text-sm text-gray-500 font-serif mb-4 line-clamp-3">{book.description}</p>

                <div className="flex items-center justify-between">
                  {book.isFree ? (
                    <>
                      <span className="text-gray-700 font-bold">Gratuit</span>
                      <button
                        onClick={() => handleDownload(book)}
                        className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 font-serif"
                      >
                        <Download className="w-4 h-4" />
                        <span>Télécharger</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-900 font-bold">{book.price} FCFA</span>
                      <button
                        onClick={() => handleWhatsAppOrder(book)}
                        className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 font-serif"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Commander</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
