'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, User, Calendar, MapPin, Phone, BookOpen, Briefcase, Shield, Hash, Upload, X, CheckCircle, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import ClientOnly from '@/components/ClientOnly'
import { useRouter } from 'next/navigation'

interface MemberFormData {
    nom: string
    prenoms: string
    nomSacre: string
    profession: string
    dateNaissance: string
    heureNaissance: string
    lieuNaissance: string
    lieuResidence: string
    religionPratique: string
    appartientAutreOrdre: 'oui' | 'non'
    precisionOrdre: string
    grade: string
    telephoneWhatsapp: string
}

export default function MemberInscriptionPage() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Tous les Hooks doivent être au début, avant tout retour conditionnel
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [showPhotoModal, setShowPhotoModal] = useState(false)
    const [uploadingPhoto, setUploadingPhoto] = useState(false)
    const [photoUploaded, setPhotoUploaded] = useState(false)
    const [selectedMemberId, setSelectedMemberId] = useState<string>('')
    const [formData, setFormData] = useState<MemberFormData>({
        nom: '',
        prenoms: '',
        nomSacre: '',
        profession: '',
        dateNaissance: '',
        heureNaissance: '',
        lieuNaissance: '',
        lieuResidence: '',
        religionPratique: '',
        appartientAutreOrdre: 'non',
        precisionOrdre: '',
        grade: 'Explorateur',
        telephoneWhatsapp: ''
    })

    useEffect(() => {
        // Vérifier l'autorisation d'accès
        const authStatus = sessionStorage.getItem('memberFormAuth')
        if (authStatus !== 'true') {
            router.push('/members/login')
        } else {
            setIsAuthorized(true)
        }
        setIsLoading(false)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Convertir la date du format jj/mm/aaaa vers aaaa-mm-jj
            const dateParts = formData.dateNaissance.split('/')
            const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`

            const response = await fetch('/api/members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    dateNaissance: formattedDate,
                    appartientAutreOrdre: formData.appartientAutreOrdre === 'oui'
                }),
            })

            if (response.ok) {
                const result = await response.json()
                setSelectedMemberId(result.id)
                setShowPhotoModal(true)
            } else {
                const errorData = await response.json()
                alert(errorData.error || 'Une erreur est survenue')
            }
        } catch (err) {
            alert('Une erreur de connexion est survenue')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !selectedMemberId) return

        setUploadingPhoto(true)

        try {
            const formDataUpload = new FormData()
            formDataUpload.append('file', file)
            formDataUpload.append('memberId', selectedMemberId)

            const response = await fetch('/api/members/upload-photo', {
                method: 'POST',
                body: formDataUpload,
            })

            if (response.ok) {
                setPhotoUploaded(true)
            } else {
                alert('Erreur lors de l\'upload de la photo')
            }
        } catch (err) {
            console.error('Erreur upload:', err)
            alert('Erreur lors de l\'upload de la photo')
        } finally {
            setUploadingPhoto(false)
        }
    }

    const handleWhatsAppRedirect = () => {
        window.open(`https://wa.me/22967153974?text=Bonjour, je viens de m'inscrire à l'OMP-ETU Bénin. Je souhaite envoyer ma photo pour compléter mon dossier.`, '_blank')
    }

    if (isLoading) {
        return (
            <ClientOnly fallback={
                <div className="min-h-screen bg-white flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Chargement...</p>
                    </div>
                </div>
            }>
                <div className="min-h-screen bg-white flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Vérification de l'autorisation...</p>
                    </div>
                </div>
            </ClientOnly>
        )
    }

    if (!isAuthorized) {
        return null
    }

    if (isSuccess) {
        return (
            <ClientOnly fallback={
                <div className="min-h-screen bg-white flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Chargement...</p>
                    </div>
                </div>
            }>
                <div className="min-h-screen bg-white">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 mb-4">
                                Inscription réussie !
                            </h1>
                            <p className="text-lg sm:text-xl text-gray-600 mb-8 font-serif">
                                Votre inscription en tant que membre a été enregistrée avec succès.
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg transition-colors text-lg font-semibold"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Retour à l'accueil</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </ClientOnly>
        )
    }

    return (
        <ClientOnly fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        }>
            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 py-4">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6">
                        <div className="flex items-center justify-between">
                            <Link
                                href="/"
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="text-base sm:text-lg font-serif">Retour à l'accueil</span>
                            </Link>
                            <div className="text-center">
                                <h1 className="text-xl sm:text-2xl font-serif text-gray-900">
                                    Fiche d'inscription Membre OMP-ETU Bénin
                                </h1>
                            </div>
                            <div className="w-20"></div>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <div className="text-center mb-8 sm:mb-12">
                        <div className="flex items-center justify-center space-x-4 sm:space-x-6 mb-6">
                            <img
                                src="https://z-cdn-media.chatglm.cn/files/68e00202-7aa7-4b85-a148-a40fdb4ac3f7_logo.png?auth_key=1791497410-4f07e789ecd94c959d996139b8c142b3-0-310a7d57abdef550ba4f1b3ace27306a"
                                alt="Logo ETU - École Transcendantaliste Universelle"
                                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24"
                            />
                            <div className="text-center sm:text-left">
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-gray-900 leading-tight">
                                    École Transcendantaliste Universelle
                                </h2>
                                <p className="text-sm sm:text-base lg:text-lg font-serif text-gray-600 uppercase tracking-wider">
                                    Ordre des Marins Pêcheurs
                                </p>
                            </div>
                        </div>

                        <div className="border-t-2 border-blue-200 pt-6">
                            <p className="text-base sm:text-lg text-gray-600 font-serif max-w-2xl mx-auto">
                                Remplissez ce formulaire pour mettre à jour la Base de Données de l'OMP-ETU Bénin.
                            </p>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <div className="max-w-2xl mx-auto">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Nom, Prénoms */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label htmlFor="nom" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        id="nom"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg font-serif"
                                        placeholder="Votre nom de famille"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="prenoms" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Prénoms *
                                    </label>
                                    <input
                                        type="text"
                                        id="prenoms"
                                        name="prenoms"
                                        value={formData.prenoms}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg font-serif"
                                        placeholder="Vos prénoms"
                                    />
                                </div>
                            </div>

                            {/* Nom Sacré */}
                            <div>
                                <label htmlFor="nomSacre" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                    <Hash className="w-4 h-4 inline mr-2" />
                                    Nom Sacré (optionnel)
                                </label>
                                <input
                                    type="text"
                                    id="nomSacre"
                                    name="nomSacre"
                                    value={formData.nomSacre}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg font-serif"
                                    placeholder="Votre nom sacré"
                                />
                            </div>

                            {/* Profession */}
                            <div>
                                <label htmlFor="profession" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                    <Briefcase className="w-4 h-4 inline mr-2" />
                                    Profession (optionnel)
                                </label>
                                <input
                                    type="text"
                                    id="profession"
                                    name="profession"
                                    value={formData.profession}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg font-serif"
                                    placeholder="Votre profession"
                                />
                            </div>

                            {/* Date de naissance */}
                            <div>
                                <label htmlFor="dateNaissance" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    Date de naissance *
                                </label>
                                <input
                                    type="text"
                                    id="dateNaissance"
                                    name="dateNaissance"
                                    value={formData.dateNaissance}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(/\D/g, '')
                                        if (value.length > 8) value = value.slice(0, 8)
                                        if (value.length >= 5) {
                                            value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`
                                        } else if (value.length >= 3) {
                                            value = `${value.slice(0, 2)}/${value.slice(2)}`
                                        }
                                        setFormData(prev => ({ ...prev, dateNaissance: value }))
                                    }}
                                    placeholder="jj/mm/aaaa"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg font-serif"
                                />
                            </div>

                            {/* Heure de naissance */}
                            <div>
                                <label htmlFor="heureNaissance" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    Heure de naissance (optionnel)
                                </label>
                                <input
                                    type="time"
                                    id="heureNaissance"
                                    name="heureNaissance"
                                    value={formData.heureNaissance}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg font-serif"
                                />
                            </div>

                            {/* Lieu de naissance */}
                            <div>
                                <label htmlFor="lieuNaissance" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-2" />
                                    Lieu de naissance *
                                </label>
                                <input
                                    type="text"
                                    id="lieuNaissance"
                                    name="lieuNaissance"
                                    value={formData.lieuNaissance}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg font-serif"
                                    placeholder="Ville, pays de naissance"
                                />
                            </div>

                            {/* Lieu de résidence */}
                            <div>
                                <label htmlFor="lieuResidence" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-2" />
                                    Lieu de résidence actuel *
                                </label>
                                <input
                                    type="text"
                                    id="lieuResidence"
                                    name="lieuResidence"
                                    value={formData.lieuResidence}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg font-serif"
                                    placeholder="Ville, pays de résidence actuel"
                                />
                            </div>

                            {/* Religion pratiquée */}
                            <div>
                                <label htmlFor="religionPratique" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                    <BookOpen className="w-4 h-4 inline mr-2" />
                                    Religion pratiquée *
                                </label>
                                <select
                                    id="religionPratique"
                                    name="religionPratique"
                                    value={formData.religionPratique}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg font-serif"
                                >
                                    <option value="">Sélectionnez votre religion</option>
                                    <option value="Christianisme">Christianisme</option>
                                    <option value="Islam">Islam</option>
                                    <option value="Judaïsme">Judaïsme</option>
                                    <option value="Bouddhisme">Bouddhisme</option>
                                    <option value="Hindouisme">Hindouisme</option>
                                    <option value="Spiritualité">Spiritualité</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>

                            {/* Appartenez-vous à un autre Ordre */}
                            <div>
                                <label htmlFor="appartientAutreOrdre" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                    <Shield className="w-4 h-4 inline mr-2" />
                                    Appartenez-vous à un autre Ordre ? *
                                </label>
                                <select
                                    id="appartientAutreOrdre"
                                    name="appartientAutreOrdre"
                                    value={formData.appartientAutreOrdre}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg font-serif"
                                >
                                    <option value="non">Non</option>
                                    <option value="oui">Oui</option>
                                </select>
                            </div>

                            {/* Précision Ordre (conditionnel) */}
                            {formData.appartientAutreOrdre === 'oui' && (
                                <div>
                                    <label htmlFor="precisionOrdre" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                        <Shield className="w-4 h-4 inline mr-2" />
                                        Si OUI, précisez l'Ordre *
                                    </label>
                                    <input
                                        type="text"
                                        id="precisionOrdre"
                                        name="precisionOrdre"
                                        value={formData.precisionOrdre}
                                        onChange={handleInputChange}
                                        required={formData.appartientAutreOrdre === 'oui'}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg font-serif"
                                        placeholder="Précisez le nom de l'Ordre"
                                    />
                                </div>
                            )}

                            {/* Grade */}
                            <div>
                                <label htmlFor="grade" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                    <Shield className="w-4 h-4 inline mr-2" />
                                    Grade *
                                </label>
                                <select
                                    id="grade"
                                    name="grade"
                                    value={formData.grade}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg font-serif"
                                >
                                    <option value="Explorateur">Explorateur</option>
                                    <option value="Constructeur">Constructeur</option>
                                    <option value="Navigateur">Navigateur</option>
                                    <option value="Alchimiste">Alchimiste</option>
                                </select>
                            </div>

                            {/* Téléphone WhatsApp */}
                            <div>
                                <label htmlFor="telephoneWhatsapp" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                    <Phone className="w-4 h-4 inline mr-2" />
                                    Numéro de téléphone WhatsApp *
                                </label>
                                <input
                                    type="tel"
                                    id="telephoneWhatsapp"
                                    name="telephoneWhatsapp"
                                    value={formData.telephoneWhatsapp}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg font-serif"
                                    placeholder="+229 67 15 39 74"
                                />
                            </div>

                            {/* Bouton de soumission */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg transition-colors text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
                                >
                                    {isSubmitting ? 'Enregistrement...' : 'Soumettre l\'inscription'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-8 sm:py-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                        <p className="text-gray-600 text-base sm:text-lg mb-2 sm:mb-3 font-serif">
                            École Transcendantaliste Universelle - Depuis 1977
                        </p>
                        <p className="text-gray-500 text-sm sm:text-base font-serif">
                            © 2024 ETU Bénin. Tous droits réservés.
                        </p>
                    </div>
                </footer>

                {/* Modal Photo */}
                {showPhotoModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full my-8 relative">
                            {/* Header avec logo et titre */}
                            <div className="border-b border-gray-200 p-6">
                                <div className="flex items-center justify-center space-x-4 mb-4">
                                    <img
                                        src="https://z-cdn-media.chatglm.cn/files/68e00202-7aa7-4b85-a148-a40fdb4ac3f7_logo.png?auth_key=1791497410-4f07e789ecd94c959d996139b8c142b3-0-310a7d57abdef550ba4f1b3ace27306a"
                                        alt="Logo ETU"
                                        className="w-12 h-12"
                                    />
                                    <div className="text-center">
                                        <h3 className="text-xl font-serif text-gray-900">
                                            École Transcendantaliste Universelle
                                        </h3>
                                        <p className="text-sm text-gray-600 font-serif uppercase tracking-wider">
                                            Ordre des Marins Pêcheurs
                                        </p>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h4 className="text-lg font-serif text-gray-900">
                                        Photo de profil
                                    </h4>
                                    <p className="text-sm text-gray-600 font-serif mt-1">
                                        Complétez votre dossier membre
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {photoUploaded ? (
                                    <div className="text-center py-8">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle className="w-10 h-10 text-green-600" />
                                        </div>
                                        <h4 className="text-xl font-serif text-gray-900 mb-3">
                                            Photo uploadée avec succès !
                                        </h4>
                                        <p className="text-base text-gray-600 font-serif mb-6 max-w-md mx-auto">
                                            Votre photo a été enregistrée dans notre base de données.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setShowPhotoModal(false)
                                                setIsSuccess(true)
                                            }}
                                            className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg transition-colors font-semibold shadow-lg"
                                        >
                                            Terminer
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-6">
                                        <div className="text-center mb-8">
                                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Upload className="w-10 h-10 text-white" />
                                            </div>
                                            <h4 className="text-xl font-serif text-gray-900 mb-3">
                                                Avez-vous une photo récente sous la main ?
                                            </h4>
                                            <p className="text-base text-gray-600 font-serif max-w-md mx-auto">
                                                Pour compléter votre dossier, nous avons besoin d'une photo récente de vous.
                                            </p>
                                        </div>

                                        <div className="max-w-md mx-auto space-y-4">
                                            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                                <div className="flex items-center mb-3">
                                                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                                        <span className="text-white font-bold text-sm">1</span>
                                                    </div>
                                                    <h5 className="font-serif text-gray-900">Upload maintenant</h5>
                                                </div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handlePhotoUpload}
                                                    disabled={uploadingPhoto}
                                                    className="hidden"
                                                />
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploadingPhoto}
                                                    className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center justify-center shadow-md"
                                                >
                                                    {uploadingPhoto ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            Upload en cours...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-4 h-4 mr-2" />
                                                            Choisir une photo
                                                        </>
                                                    )}
                                                </button>
                                                <p className="text-xs text-gray-500 mt-2 text-center font-serif">
                                                    Formats acceptés : JPG, PNG, WEBP (max 10MB)
                                                </p>
                                            </div>

                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-gray-300"></div>
                                                </div>
                                                <div className="relative flex justify-center text-sm">
                                                    <span className="px-3 bg-white text-gray-500 font-serif">ou</span>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                                <div className="flex items-center mb-3">
                                                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                                        <span className="text-white font-bold text-sm">2</span>
                                                    </div>
                                                    <h5 className="font-serif text-gray-900">Envoyer par WhatsApp plus tard</h5>
                                                </div>
                                                <button
                                                    onClick={handleWhatsAppRedirect}
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center justify-center shadow-md"
                                                >
                                                    <MessageCircle className="w-4 h-4 mr-2" />
                                                    Envoyer par WhatsApp
                                                </button>
                                                <p className="text-xs text-gray-500 mt-2 text-center font-serif">
                                                    Envoyez votre photo au <span className="font-semibold text-gray-700">+229 67 15 39 74</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer du modal - Bouton Passer */}
                            {!photoUploaded && (
                                <div className="p-6 border-t border-gray-200 bg-gray-50">
                                    <button
                                        onClick={() => {
                                            setShowPhotoModal(false)
                                            setIsSuccess(true)
                                        }}
                                        className="w-full bg-transparent hover:bg-gray-100 text-gray-700 px-6 py-3 rounded-lg transition-colors font-semibold border border-gray-300"
                                    >
                                        Passer pour l'instant
                                    </button>
                                    <p className="text-xs text-gray-500 text-center mt-3 font-serif">
                                        Vous pourrez toujours envoyer votre photo plus tard
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </ClientOnly>
    )
}
