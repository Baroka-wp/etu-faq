'use client'

import { useState } from 'react'
import { Lock, ArrowLeft } from 'lucide-react'
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
            <div className="min-h-screen bg-white flex flex-col">
                {/* Header */}
                <header className="border-b-2 border-black px-6 py-3">
                    <Link
                        href="/"
                        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-serif"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Accueil</span>
                    </Link>
                </header>

                {/* Contenu */}
                <main className="flex-1 flex items-center justify-center px-4 py-8">
                    <div className="w-full max-w-sm">
                        {/* Titre */}
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-serif font-bold text-gray-900">Accès Formulaire</h1>
                            <p className="text-sm text-gray-500 font-serif mt-0.5">Inscription membre ETU</p>
                        </div>

                        {/* Bloc formulaire */}
                        <div className="border-2 border-black">
                            {/* Erreur */}
                            {error && (
                                <div className="bg-red-50 border-b-2 border-red-200 text-red-800 px-4 py-2.5 text-sm font-serif">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="px-4 py-4 border-b-1 border-black">
                                    <label htmlFor="password" className="block text-xs font-serif text-gray-600 mb-1.5 uppercase tracking-wide">
                                        Mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-3 py-2.5 border-2 border-black text-sm font-serif focus:outline-none focus:bg-gray-50"
                                        placeholder="Mot de passe TIGM"
                                        autoComplete="current-password"
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white px-4 py-3 text-sm font-serif font-semibold transition-colors disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Lock className="w-4 h-4 animate-pulse" />
                                            <span>Vérification...</span>
                                        </>
                                    ) : (
                                        <span>Accéder au formulaire</span>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Déjà un espace ? */}
                        <div className="mt-4 border-1 border-black bg-red-50 px-4 py-3">
                            <p className="text-xs text-gray-700 font-serif mb-2">
                                Vous avez déjà rempli le formulaire ?
                            </p>
                            <Link
                                href="/membre/dashboard"
                                className="inline-block bg-gray-900 hover:bg-black text-white px-4 py-2 text-xs font-semibold transition-colors"
                            >
                                Aller à mon espace
                            </Link>
                        </div>

                        {/* Info TIGM */}
                        <div className="mt-3 text-center">
                            <p className="text-xs text-gray-500 font-serif">
                                Mot de passe disponible auprès du <strong>TIGM</strong> de l'ETU Bénin
                            </p>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t-2 border-black px-6 py-3 text-center">
                    <p className="text-xs text-gray-500 font-serif">
                        ETU Bénin — École Transcendantaliste Universelle
                    </p>
                </footer>
            </div>
        </ClientOnly>
    )
}
