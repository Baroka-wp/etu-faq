'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Upload, Image as ImageIcon, BookOpen, Save, X } from 'lucide-react'

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
  createdAt: string
  updatedAt: string
}

export default function AdminBibliothequePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    isFree: false,
    category: 'etu' as 'etu' | 'recommended',
    imageUrl: '',
    whatsappMessage: ''
  })

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/admin/bibliotheque')
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

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'etu_bibliotheque')

      const response = await fetch('/api/admin/bibliotheque/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, imageUrl: data.secure_url }))
        alert('Image uploadée avec succès')
      } else {
        throw new Error('Erreur lors de l\'upload')
      }
    } catch (error) {
      console.error('Erreur upload:', error)
      alert('Impossible d\'uploader l\'image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const bookData = {
        ...formData,
        price: formData.isFree ? null : parseFloat(formData.price),
        whatsappMessage: formData.whatsappMessage || 
          (formData.isFree 
            ? `Bonjour, je souhaite obtenir des informations sur "${formData.title}" (lecture gratuite recommandée).`
            : `Bonjour, je souhaite commander "${formData.title}" (${formData.price} FCFA).`)
      }

      const url = editingBook ? `/api/admin/bibliotheque/${editingBook.id}` : '/api/admin/bibliotheque'
      const method = editingBook ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookData)
      })

      if (response.ok) {
        alert(`Le livre "${formData.title}" a été ${editingBook ? 'modifié' : 'ajouté'} avec succès`)
        fetchBooks()
        resetForm()
        setShowAddModal(false)
        setShowEditModal(false)
      } else {
        throw new Error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Impossible de sauvegarder le livre')
    }
  }

  const handleEdit = (book: Book) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price?.toString() || '',
      isFree: book.isFree,
      category: book.category,
      imageUrl: book.imageUrl,
      whatsappMessage: book.whatsappMessage
    })
    setShowEditModal(true)
  }

  const handleDelete = async (bookId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) return

    try {
      const response = await fetch(`/api/admin/bibliotheque/${bookId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Le livre a été supprimé avec succès')
        fetchBooks()
      } else {
        throw new Error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Impossible de supprimer le livre')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      price: '',
      isFree: false,
      category: 'etu',
      imageUrl: '',
      whatsappMessage: ''
    })
    setEditingBook(null)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion de la Bibliothèque</h1>
              <p className="text-gray-600 mt-2">Gérez les livres et ouvrages de l'ETU-Bénin</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter un livre
            </button>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    book.isFree 
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

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(book)}
                    className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {books.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun livre</h3>
            <p className="text-gray-600 mb-4">Commencez par ajouter votre premier livre</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
            >
              Ajouter un livre
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBook ? 'Modifier le livre' : 'Ajouter un livre'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre du livre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auteur *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'etu' | 'recommended' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  >
                    <option value="etu">Éditions ETU</option>
                    <option value="recommended">Lectures recommandées</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={formData.isFree}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFree: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Livre gratuit</span>
                  </label>
                  {!formData.isFree && (
                    <input
                      type="number"
                      placeholder="Prix en FCFA"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                    />
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image de couverture
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file)
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingImage ? 'Upload...' : 'Choisir une image'}
                    </label>
                    {formData.imageUrl && (
                      <div className="flex items-center text-green-600">
                        <ImageIcon className="w-4 h-4 mr-1" />
                        Image uploadée
                      </div>
                    )}
                  </div>
                  {formData.imageUrl && (
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="mt-2 w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                </div>

                {/* WhatsApp Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message WhatsApp (optionnel)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.whatsappMessage}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsappMessage: e.target.value }))}
                    placeholder="Message automatique généré si vide"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setShowEditModal(false)
                      resetForm()
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingBook ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}