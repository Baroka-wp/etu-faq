'use client'

import { useState } from 'react'
import { ArrowLeft, User, Calendar, MapPin, Phone, BookOpen, Mail } from 'lucide-react'
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
                <main className="min-h-screen bg-[#faf9f7] px-6 py-12 text-stone-900 sm:py-20">
                    <article className="mx-auto max-w-2xl space-y-8 font-serif text-lg leading-relaxed sm:text-xl sm:leading-relaxed">
                        <header>
                            <h1 className="text-balance font-sans text-3xl font-light leading-tight sm:text-4xl">Demande d’inscription enregistrée</h1>
                            <p className="mt-5">Cher Aspirant explorateur,<br />Nous avons bien reçu votre fiche d’inscription.</p>
                        </header>
                        <section className="space-y-4">
                            <h2 className="font-sans text-xl font-medium sm:text-2xl">Vos prochaines étapes</h2>
                            <ol className="list-decimal space-y-5 pl-6 marker:font-semibold">
                                <li className="pl-1">
                                    <strong className="font-semibold">Réglez les frais d’inscription de 12 000 FCFA.</strong>
                                    <ul className="mt-1 list-disc pl-5">
                                        <li>Au Bénin, par MoMo au <span className="whitespace-nowrap">+229 01 67 15 39 74</span>.</li>
                                        <li>Depuis l’étranger, par Western Union ou MoneyGram.</li>
                                    </ul>
                                </li>
                                <li className="pl-1">
                                    <strong className="font-semibold">Demandez l’activation de votre compte.</strong>
                                    <p>Envoyez la capture d’écran du paiement par WhatsApp au <a className="whitespace-nowrap underline underline-offset-4" href="https://wa.me/22967153974">+229 67 15 39 74</a>.</p>
                                </li>
                                <li className="pl-1"><a className="inline-flex min-h-11 items-center rounded-lg bg-fuchsia-200 px-4 py-2 font-sans text-base font-medium sm:text-lg text-fuchsia-950 hover:bg-fuchsia-300" href="https://chat.whatsapp.com/HbCOaq0Adra86k4qjkDW6D?mode=gi_t">Rejoindre le groupe WhatsApp de la formation</a></li>
                            </ol>
                        </section>
                        <section className="space-y-3 border-t border-stone-200 pt-6">
                            <h2 className="font-sans text-xl font-medium sm:text-2xl">Informations sur les cours</h2>
                            <p>Chaque séance associe lecture des textes, interprétation et discussion.</p>
                            <ul className="list-disc space-y-1 pl-5">
                                <li><strong className="font-semibold">En ligne</strong> chaque vendredi à 21 h.</li>
                                <li><strong className="font-semibold">En présentiel</strong> le deuxième vendredi de chaque mois.</li>
                            </ul>
                            <p>Les cours de Kabbale sont disponibles en <Link href="/videotheque" className="underline underline-offset-4">vidéothèque</Link> avec votre code personnel.</p>
                        </section>
                        <section className="space-y-2">
                            <h2 className="font-sans text-xl font-medium sm:text-2xl">Votre engagement spirituel</h2>
                            <p className="font-semibold">Étude · Prière · Charité</p>
                            <p>Étudiez avec assiduité les enseignements de l’École. Pour cultiver la prière au quotidien, relevez le défi de <strong className="font-semibold">154 jours de prière</strong> avec constance et persévérance.</p>
                            <p>Votre livre de prière : <Link href="/bibliotheque/lumiere-divine-premiers-pas" className="underline underline-offset-4">Lumière divine – Premiers pas</Link>.</p>
                        </section>
                        <p className="italic text-stone-600">Dans la Paix et la Lumière.</p>
                        <Link href="/" className="inline-flex items-center gap-2 font-sans text-base text-stone-600 hover:underline">
                            <ArrowLeft className="h-4 w-4" /> Retour à l’accueil
                        </Link>
                    </article>
                </main>
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
                        <h1 className="text-4xl sm:text-5xl font-light tracking-wide text-stone-900 mb-3">Fiche d'inscription</h1>
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
                                    <label htmlFor="nom" className="block text-base sm:text-lg font-serif text-stone-800 mb-2">
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-base font-serif transition-all"
                                        placeholder="Votre nom de famille"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="prenom" className="block text-base sm:text-lg font-serif text-stone-800 mb-2">
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-base font-serif transition-all"
                                        placeholder="Votre prénom"
                                    />
                                </div>
                            </div>

                            {/* Sexe */}
                            <div>
                                <label htmlFor="sexe" className="block text-base sm:text-lg font-serif text-stone-800 mb-2">
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
                                <label htmlFor="dateNaissance" className="block text-base sm:text-lg font-serif text-stone-800 mb-2">
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
                                <label htmlFor="heureNaissance" className="block text-base sm:text-lg font-serif text-stone-800 mb-2">
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
                                <label htmlFor="lieuNaissance" className="block text-base sm:text-lg font-serif text-stone-800 mb-2">
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
                                <label htmlFor="lieuResidence" className="block text-base sm:text-lg font-serif text-stone-800 mb-2">
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
                                <label htmlFor="religion" className="block text-base sm:text-lg font-serif text-stone-800 mb-2">
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
                                <label htmlFor="telephone" className="block text-base sm:text-lg font-serif text-stone-800 mb-2">
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
                                <label htmlFor="email" className="block text-base sm:text-lg font-serif text-stone-800 mb-2">
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
