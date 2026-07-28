'use client'

import { useEffect, useState, useRef } from 'react'
import { User, Mail, Phone, MapPin, Save, Camera, Loader2 } from 'lucide-react'
import { useToast } from '@/components/Toast'
import { ToastContainer } from '@/components/ToastContainer'
import MemberIdentityCard from '@/components/admin/MemberIdentityCard'

export default function ProfilPage() {
  const { addToast, toasts, removeToast } = useToast()
  const [membre, setMembre] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchMembre()
  }, [])

  const fetchMembre = async () => {
    try {
      const response = await fetch('/api/membre/me')
      if (response.ok) {
        const data = await response.json()
        setMembre(data.membre)
        setFormData(data.membre)
      } else {
        addToast({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger votre profil'
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue lors du chargement'
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('/api/membre/profil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setMembre(data.membre)
        setFormData(data.membre)
        addToast({
          type: 'success',
          title: 'Succès',
          message: data.message || 'Profil mis à jour avec succès'
        })
      } else {
        addToast({
          type: 'error',
          title: 'Erreur',
          message: data.error || 'Une erreur est survenue'
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue lors de la mise à jour'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez sélectionner une image'
      })
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'L\'image est trop volumineuse (max 5MB)'
      })
      return
    }

    setIsUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/membre/profil/upload', {
        method: 'POST',
        body: uploadFormData
      })

      const data = await response.json()

      if (response.ok) {
        setMembre((prev: any) => ({ ...prev, imageUrl: data.imageUrl }))
        setFormData((prev: any) => ({ ...prev, imageUrl: data.imageUrl }))
        addToast({
          type: 'success',
          title: 'Succès',
          message: data.message || 'Photo de profil mise à jour avec succès'
        })
      } else {
        addToast({
          type: 'error',
          title: 'Erreur',
          message: data.error || 'Une erreur est survenue lors de l\'upload'
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue lors de l\'upload'
      })
    } finally {
      setIsUploading(false)
      // Reset l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (!membre) return <div className="p-8">Chargement...</div>

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Mon Profil</h1>

      <div className="mb-8">
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Ma carte de membre</h2>
          <p className="text-sm text-gray-500">Présentez ce QR code à un administrateur pour enregistrer votre présence.</p>
        </div>
        <MemberIdentityCard membre={membre} />
      </div>

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
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
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
                <User className="w-4 h-4 inline mr-2" />Nom sacré
              </label>
              <input
                type="text"
                value={formData.nomSacre || ''}
                onChange={(e) => setFormData({...formData, nomSacre: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg font-serif"
              />
            </div>
            <div>
              <label className="block text-sm font-serif text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />Profession
              </label>
              <input
                type="text"
                value={formData.profession || ''}
                onChange={(e) => setFormData({...formData, profession: e.target.value})}
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
                <Phone className="w-4 h-4 inline mr-2" />Téléphone WhatsApp
              </label>
              <input
                type="tel"
                value={formData.telephoneWhatsapp || ''}
                onChange={(e) => setFormData({...formData, telephoneWhatsapp: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg font-serif"
              />
            </div>
            <div>
              <label className="block text-sm font-serif text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />Date de naissance
              </label>
              <input
                type="text"
                value={formData.dateNaissance || ''}
                onChange={(e) => setFormData({...formData, dateNaissance: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg font-serif"
                placeholder="JJ/MM/AAAA"
              />
            </div>
            <div>
              <label className="block text-sm font-serif text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />Lieu de naissance
              </label>
              <input
                type="text"
                value={formData.lieuNaissance || ''}
                onChange={(e) => setFormData({...formData, lieuNaissance: e.target.value})}
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
            <div>
              <label className="block text-sm font-serif text-gray-700 mb-2">
                Religion pratiquée
              </label>
              <input
                type="text"
                value={formData.religionPratique || ''}
                onChange={(e) => setFormData({...formData, religionPratique: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg font-serif"
              />
            </div>
            <div>
              <label className="block text-sm font-serif text-gray-700 mb-2">
                Appartient à un autre ordre
              </label>
              <select
                value={formData.appartientAutreOrdre ? 'oui' : 'non'}
                onChange={(e) => setFormData({...formData, appartientAutreOrdre: e.target.value === 'oui'})}
                className="w-full px-4 py-2 border rounded-lg font-serif"
              >
                <option value="non">Non</option>
                <option value="oui">Oui</option>
              </select>
            </div>
            {formData.appartientAutreOrdre && (
              <div className="md:col-span-2">
                <label className="block text-sm font-serif text-gray-700 mb-2">
                  Précisions sur l'autre ordre
                </label>
                <input
                  type="text"
                  value={formData.precisionOrdre || ''}
                  onChange={(e) => setFormData({...formData, precisionOrdre: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg font-serif"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 font-serif flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
