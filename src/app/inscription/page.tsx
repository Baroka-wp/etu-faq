'use client'

import { useState } from 'react'
import { ArrowLeft, User, Calendar, MapPin, Phone, BookOpen, CheckCircle, X } from 'lucide-react'
import Link from 'next/link'
import ClientOnly from '@/components/ClientOnly'

interface InscriptionData {
    nom: string
    prenom: string
    sexe: string
    dateNaissance: string
    heureNaissance: string
    lieuNaissance: string
    lieuResidence: string
    religion: string
    telephone: string
}

export default function InscriptionPage() {
    const [formData, setFormData] = useState<InscriptionData>({
        nom: '',
        prenom: '',
        sexe: '',
        dateNaissance: '',
        heureNaissance: '',
        lieuNaissance: '',
        lieuResidence: '',
        religion: '',
        telephone: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState('')
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        try {
            const response = await fetch('/api/inscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                const result = await response.json()
                setShowWhatsAppModal(true)
            } else {
                const errorData = await response.json()
                setError(errorData.error || 'Une erreur est survenue')
            }
        } catch (err) {
            setError('Une erreur de connexion est survenue')
        } finally {
            setIsSubmitting(false)
        }
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
                                Votre inscription a été enregistrée avec succès. Nous vous contacterons bientôt.
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors text-lg font-semibold"
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
                                    Inscription ETU
                                </h1>
                            </div>
                            <div className="w-20"></div> {/* Spacer pour centrer le titre */}
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
                            <h4 className="text-xl sm:text-2xl font-serif text-gray-900 mb-4">
                                Fiche d'inscription
                            </h4>
                            <p className="text-base sm:text-lg text-gray-600 font-serif max-w-2xl mx-auto">
                                Remplissez ce formulaire pour commencer votre parcours d'élévation spirituelle avec l'ETU.
                            </p>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <div className="max-w-2xl mx-auto">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-600 text-sm font-serif">{error}</p>
                                </div>
                            )}

                            {/* Nom, Prénom et Sexe */}
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
                                    <label htmlFor="prenom" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Prénom *
                                    </label>
                                    <input
                                        type="text"
                                        id="prenom"
                                        name="prenom"
                                        value={formData.prenom}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg font-serif"
                                        placeholder="Votre prénom"
                                    />
                                </div>
                            </div>

                            {/* Sexe */}
                            <div>
                                <label htmlFor="sexe" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Sexe *
                                </label>
                                <select
                                    id="sexe"
                                    name="sexe"
                                    value={formData.sexe}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg font-serif"
                                >
                                    <option value="">Sélectionnez votre sexe</option>
                                    <option value="Masculin">Masculin</option>
                                    <option value="Féminin">Féminin</option>
                                </select>
                            </div>

                            {/* Date de naissance */}
                            <div>
                                <label htmlFor="dateNaissance" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    Date de naissance *
                                </label>
                                <input
                                    type="date"
                                    id="dateNaissance"
                                    name="dateNaissance"
                                    value={formData.dateNaissance}
                                    onChange={handleInputChange}
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

                            {/* Religion */}
                            <div>
                                <label htmlFor="religion" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                    <BookOpen className="w-4 h-4 inline mr-2" />
                                    Religion pratiquée *
                                </label>
                                <select
                                    id="religion"
                                    name="religion"
                                    value={formData.religion}
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

                            {/* Téléphone */}
                            <div>
                                <label htmlFor="telephone" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                    <Phone className="w-4 h-4 inline mr-2" />
                                    Numéro de téléphone WhatsApp *
                                </label>
                                <input
                                    type="tel"
                                    id="telephone"
                                    name="telephone"
                                    value={formData.telephone}
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

                {/* Modal WhatsApp */}
                {showWhatsAppModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[95vh] overflow-y-auto relative">
                            {/* Bouton de fermeture fixe */}
                            <button
                                onClick={() => setShowWhatsAppModal(false)}
                                className="absolute top-2 right-2 z-10 p-1.5 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-md"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>

                            {/* Header */}
                            <div className="p-3 border-b border-gray-200">
                                <h3 className="text-base font-serif text-gray-900 pr-8">
                                    Inscription réussie !
                                </h3>
                            </div>

                            {/* Content */}
                            <div className="p-3">
                                <div className="text-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                    <h4 className="text-sm font-serif text-gray-900 mb-1">
                                        Félicitations {formData.prenom} !
                                    </h4>
                                    <p className="text-xs text-gray-600 font-serif">
                                        Votre inscription a été enregistrée avec succès.
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                                    <h5 className="text-sm font-serif text-gray-900 mb-3 text-center">
                                        Il reste encore une étape importante !
                                    </h5>

                                    <div className="space-y-3">
                                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                                            <h6 className="text-xs font-serif text-gray-900 mb-2">
                                                Étape 1 : Effectuer le paiement
                                            </h6>
                                            <div className="text-xs text-gray-700 font-serif space-y-2">
                                                <p><strong>Frais d'inscription :</strong> <span className="font-bold text-gray-900">12 000 FCFA + frais de retrait</span></p>
                                                <p className="text-center">
                                                    <span className="text-lg font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                                                        +229 01 67 15 39 74
                                                    </span>
                                                </p>
                                                <p className="text-xs text-gray-600 text-center">
                                                    Pour les paiements par carte, contactez le WhatsApp : +229 67 15 39 74
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                                            <h6 className="text-xs font-serif text-gray-900 mb-2">
                                                Étape 2 : Envoyer la capture d'écran
                                            </h6>
                                            <p className="text-xs text-gray-700 font-serif">
                                                Envoyez la capture d'écran du paiement au
                                                <span className="font-bold text-gray-900"> +229 67 15 39 74</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <a
                                        href={`https://wa.me/22967153974?text=Bonjour, je viens de m'inscrire à l'ETU. Voici mes informations: ${formData.nom} ${formData.prenom}, ${formData.telephone}. J'ai effectué le paiement des frais d'inscription de 12 000 FCFA au numéro +229 01 67 15 39 74. Voici la capture d'écran du paiement.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 px-3 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2 text-sm"
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span>Envoyer la capture d'écran</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ClientOnly>
    )
}
