'use client'

import { useState } from 'react'
import { Lock, ArrowLeft, LogIn, Shield } from 'lucide-react'
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-serif">Chargement...</p>
                </div>
            </div>
        }>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
                {/* Header léger */}
                <header className="px-6 py-4">
                    <Link
                        href="/"
                        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-serif group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Retour à l'accueil</span>
                    </Link>
                </header>

                {/* Contenu central */}
                <main className="flex-1 flex items-center justify-center px-4 py-8">
                    <div className="w-full max-w-md">
                        {/* Logo et titre */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl shadow-lg mb-4">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Accès Formulaire</h1>
                            <p className="text-sm text-gray-600 font-serif">Inscription membre ETU Bénin</p>
                        </div>

                        {/* Carte principale */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                            {/* Message d'erreur */}
                            {error && (
                                <div className="bg-red-50 border-b border-red-200 px-6 py-4">
                                    <div className="flex items-center gap-2 text-red-800">
                                        <Lock className="w-4 h-4" />
                                        <p className="text-sm font-serif font-medium">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Formulaire */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-serif font-medium text-gray-700 mb-2">
                                        Mot de passe TIGM
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm font-serif focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                            placeholder="Entrez le mot de passe"
                                            autoComplete="current-password"
                                            autoFocus
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500 font-serif">
                                        Ce mot de passe est fourni par le TIGM de l'ETU Bénin
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white px-6 py-3.5 rounded-xl text-sm font-serif font-semibold transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center space-x-2 group"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Lock className="w-4 h-4 animate-pulse" />
                                            <span>Vérification...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Accéder au formulaire</span>
                                            <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Carte alternative - Déjà membre */}
                        <div className="mt-6 bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <LogIn className="w-5 h-5 text-gray-600" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-serif font-semibold text-gray-900 mb-1">
                                        Vous avez déjà remplis le formulaire ?
                                    </h3>
                                    <p className="text-xs text-gray-600 font-serif mb-3">
                                        Accédez directement à votre espace membre
                                    </p>
                                    <Link
                                        href="/membre/login"
                                        className="inline-flex items-center gap-2 text-sm font-serif font-medium text-gray-900 hover:text-gray-700 transition-colors group"
                                    >
                                        <span>Connexion membre</span>
                                        <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer épuré */}
                <footer className="px-6 py-6 text-center">
                    <p className="text-xs text-gray-500 font-serif">
                        ETU Bénin — École Transcendantaliste Universelle — Depuis 1977
                    </p>
                </footer>
            </div>
        </ClientOnly>
    )
}
