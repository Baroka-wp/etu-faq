'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Filter, ShoppingCart, MessageCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Book {
  id: string
  title: string
  author: string
  description: string
  price?: number
  isFree: boolean
  category: 'etu' | 'recommended'
  imageUrl: string
  whatsappMessage: string
}

export default function BibliothequePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'etu' | 'recommended'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/bibliotheque')
      if (response.ok) {
        const data = await response.json()
        setBooks(data.books)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des livres:', error)
    } finally {
      setLoading(false)
    }
  }

    const filteredBooks = books.filter(book => {
        const matchesFilter = filter === 'all' || book.category === filter
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.description.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesFilter && matchesSearch
    })

  const handleWhatsAppOrder = (book: Book) => {
    const message = encodeURIComponent(book.whatsappMessage)
    const whatsappUrl = `https://wa.me/229XXXXXXXX?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la bibliothèque...</p>
        </div>
      </div>
    )
  }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gray-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center mb-4">
                        <Image
                            src="/logo.svg"
                            alt="ETU-Bénin Logo"
                            width={40}
                            height={40}
                            className="mr-3"
                        />
                        <h1 className="text-4xl font-bold font-serif">Bibliothèque ETU-Bénin</h1>
                    </div>
                    <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto">
                        Découvrez notre collection de livres et ouvrages pour approfondir votre parcours spirituel
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="text-gray-600 hover:text-gray-900 flex items-center"
                    >
                        ← Retour à l'accueil
                    </Link>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Rechercher un livre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg flex items-center ${filter === 'all'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Tous
                            </button>
                            <button
                                onClick={() => setFilter('etu')}
                                className={`px-4 py-2 rounded-lg flex items-center ${filter === 'etu'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <BookOpen className="w-4 h-4 mr-2" />
                                Éditions ETU
                            </button>
                            <button
                                onClick={() => setFilter('recommended')}
                                className={`px-4 py-2 rounded-lg flex items-center ${filter === 'recommended'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Lectures recommandées
                            </button>
                        </div>
                    </div>
                </div>

                {/* Books Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBooks.map((book) => (
                        <div key={book.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Book Image */}
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {book.imageUrl ? (
                  <img 
                    src={book.imageUrl} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="w-16 h-16 text-gray-400" />
                )}
              </div>

                            {/* Book Content */}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${book.isFree
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {book.isFree ? 'Gratuit' : 'Payant'}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-2">par {book.author}</p>

                                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{book.description}</p>

                                {book.price && (
                                    <div className="text-lg font-bold text-gray-900 mb-4">
                                        {book.price.toLocaleString()} FCFA
                                    </div>
                                )}

                                <button
                                    onClick={() => handleWhatsAppOrder(book)}
                                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    {book.isFree ? 'Demander des infos' : 'Commander'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredBooks.length === 0 && (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun livre trouvé</h3>
                        <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
                    </div>
                )}

                {/* Info Section */}
                <div className="mt-12 bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Comment commander ?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                        <div>
                            <h4 className="font-medium mb-2">📚 Éditions ETU</h4>
                            <p>Livres officiels de l'ETU-Bénin avec prix fixe. Commande via WhatsApp avec paiement à la livraison.</p>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">📖 Lectures recommandées</h4>
                            <p>Ouvrages de référence gratuits. Obtenez des informations sur où les trouver ou les télécharger.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
