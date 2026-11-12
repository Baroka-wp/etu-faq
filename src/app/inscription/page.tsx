'use client'

import { useState } from 'react'
import { ArrowLeft, User, Calendar, MapPin, Phone, BookOpen, CheckCircle, Mail } from 'lucide-react'
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
    email: string
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
        email: '',
        telephone: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState('')
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
                setIsSuccess(true)
                window.scrollTo(0, 0)
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
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600 font-serif">Chargement...</p>
                    </div>
                </div>
            }>
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-12 h-12 text-gray-900" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4">
                                Inscription réussie !
                            </h1>
                            <div className="my-8 space-y-4 text-left font-serif leading-relaxed text-gray-700">
                                <p>Cher Aspirant explorateur,</p>
                                <p>Merci pour votre inscription à la formation.</p>
                                <p>L’inscription est désormais gratuite.</p>
                                <h2 className="font-semibold">Ce qu’il faut faire</h2>
                                <ol className="list-decimal space-y-4 pl-6">
                                    <li><a className="inline-flex min-h-11 items-center justify-center rounded-xl bg-fuchsia-200 px-5 py-3 text-center text-sm font-semibold text-fuchsia-950 hover:bg-fuchsia-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-700" href="https://chat.whatsapp.com/Kzawjc2gC2OJjuxkNlbWxt?mode=gi_t">Rejoindre le groupe WhatsApp de la formation</a></li>
                                    <li>Si vous rencontrez une difficulté avec le formulaire, vous pouvez également écrire directement à <a className="underline" href="mailto:guerashel@gmail.com">guerashel@gmail.com</a> ou adresser un message en privé au frère Isaac @Isaac LAKPE, en communiquant :
                                        <ul className="mt-2 list-disc pl-5">
                                            <li>Nom et prénom(s)</li>
                                            <li>Date de naissance</li>
                                            <li>Pays de résidence</li>
                                            <li>Ville de résidence</li>
                                            <li>Numéro WhatsApp</li>
                                            <li>Adresse électronique</li>
                                        </ul>
                                    </li>
                                </ol>
                                <p>Merci d’accompagner ces informations de la mention suivante :</p>
                                <p>Rendez-vous tous les dimanches pour une séance en live 🙏🏽</p>
                                <p>Dans la Paix et la Lumière.</p>
                            </div>
                            <Link
                                href="/"
                                className="inline-flex items-center space-x-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl transition-all text-base font-semibold font-serif shadow-lg hover:shadow-xl"
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-serif">Chargement...</p>
                </div>
            </div>
        }>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Header */}
                <header className="px-6 py-4">
                    <Link
                        href="/"
                        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-serif group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Retour à l'accueil</span>
                    </Link>
                </header>

                {/* Hero Section */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Fiche d'inscription</h1>
                        <p className="text-sm text-gray-600 font-serif">École Transcendantaliste Universelle - OMP Bénin</p>
                    </div>

                    {/* Formulaire */}
                    <div className="max-w-2xl mx-auto">
                        <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm font-serif transition-all"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm font-serif transition-all"
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
                                    type="text"
                                    id="heureNaissance"
                                    name="heureNaissance"
                                    value={formData.heureNaissance}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(/\D/g, '')
                                        if (value.length > 4) value = value.slice(0, 4)
                                        if (value.length >= 3) {
                                            value = `${value.slice(0, 2)}:${value.slice(2)}`
                                        } else {
                                            value = value.slice(0, 2)
                                        }
                                        setFormData(prev => ({ ...prev, heureNaissance: value }))
                                    }}
                                    placeholder="hh:mm"
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

                            <div>
                                <label htmlFor="email" className="block text-sm sm:text-base font-serif text-gray-700 mb-2">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Adresse électronique *
                                </label>
                                <input type="email" id="email" name="email" autoComplete="email" maxLength={254}
                                    value={formData.email} onChange={handleInputChange} required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 text-sm font-serif" />
                            </div>

                            {/* Bouton de soumission */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white px-6 py-3.5 rounded-xl text-sm font-serif font-semibold transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {isSubmitting ? 'Enregistrement...' : 'Soumettre l\'inscription'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Footer */}
                <footer className="px-6 py-6 text-center">
                    <p className="text-xs text-gray-500 font-serif">
                        ETU Bénin ; École Transcendantaliste Universelle ; Depuis 1977
                    </p>
                </footer>

            </div>
        </ClientOnly>
    )
}
