'use client'

import { useEffect, useState } from 'react'
import { User, Mail, Phone, MapPin, Save, Camera } from 'lucide-react'

export default function ProfilPage() {
  const [membre, setMembre] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    fetchMembre()
  }, [])

  const fetchMembre = async () => {
    const response = await fetch('/api/membre/me')
    if (response.ok) {
      const data = await response.json()
      setMembre(data.membre)
      setFormData(data.membre)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Appeler l'API de mise à jour
    alert('Mise à jour du profil à implémenter')
  }

  if (!membre) return <div className="p-8">Chargement...</div>

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Mon Profil</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-6 mb-8">
          <div className="relative">
            {membre.imageUrl ? (
              <img src={membre.imageUrl} alt="Photo" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <button className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-900">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-bold font-serif">{membre.nomSacre || `${membre.prenoms} ${membre.nom}`}</h2>
            <p className="text-gray-600 font-serif">{membre.grade} - {membre.equipage}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-serif text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />Nom
              </label>
              <input
                type="text"
                value={formData.nom || ''}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg font-serif"
              />
            </div>
            <div>
              <label className="block text-sm font-serif text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />Prénoms
              </label>
              <input
                type="text"
                value={formData.prenoms || ''}
                onChange={(e) => setFormData({...formData, prenoms: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg font-serif"
              />
            </div>
            <div>
              <label className="block text-sm font-serif text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg font-serif"
              />
            </div>
            <div>
              <label className="block text-sm font-serif text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />Téléphone
              </label>
              <input
                type="tel"
                value={formData.telephoneWhatsapp || ''}
                onChange={(e) => setFormData({...formData, telephoneWhatsapp: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg font-serif"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-serif text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />Lieu de résidence
              </label>
              <input
                type="text"
                value={formData.lieuResidence || ''}
                onChange={(e) => setFormData({...formData, lieuResidence: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg font-serif"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 font-serif flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Enregistrer les modifications</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
