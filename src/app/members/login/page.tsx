'use client'

import { useState } from 'react'
import { Lock, ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ClientOnly from '@/components/ClientOnly'

const MEMBER_ACCESS_PASSWORD = process.env.NEXT_PUBLIC_MEMBER_ACCESS_PASSWORD

export default function MemberLoginPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        if (password === MEMBER_ACCESS_PASSWORD) {
            sessionStorage.setItem('memberFormAuth', 'true')
            router.push('/members/inscription')
        } else {
            setError('Mot de passe incorrect')
            setIsSubmitting(false)
        }
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
                                    Accès Membres - ETU
                                </h1>
                            </div>
                            <div className="w-20"></div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
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
                                Espace Membre
                            </h4>
                            <p className="text-base sm:text-lg text-gray-600 font-serif max-w-2xl mx-auto">
                                Accédez au formulaire d'inscription des membres. Cette page est réservée aux personnes invitées.
                            </p>
                        </div>
                    </div>

                    {/* Login Form */}
                    <div className="max-w-md mx-auto">
                        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 sm:p-8">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lock className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-serif text-gray-900 mb-2">
                                    Authentification requise
                                </h3>
                                <p className="text-sm text-gray-600 font-serif">
                                    Veuillez entrer le mot de passe pour accéder au formulaire d'inscription des membres.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-red-600 text-sm font-serif">{error}</p>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="password" className="block text-sm font-serif text-gray-700 mb-2">
                                        <Shield className="w-4 h-4 inline mr-2" />
                                        Mot de passe *
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-serif"
                                        placeholder="Entrez le mot de passe"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg transition-colors text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
                                >
                                    {isSubmitting ? 'Vérification...' : 'Accéder au formulaire'}
                                </button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-xs text-gray-500 text-center font-serif">
                                    Cette page est protégée. Seul le personnel autorisé peut y accéder.
                                </p>
                            </div>
                        </div>
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
            </div>
        </ClientOnly>
    )
}
