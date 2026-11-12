'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff, ArrowLeft, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { demandeCode } from '@/lib/acces-video'
import ClientOnly from '@/components/ClientOnly'

export default function MemberLoginPage() {
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const params = new URLSearchParams(window.location.search)
            const video = params.get('retour') === '/videotheque'
            const seance = params.get('seance')
            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password, videotheque: video }),
            })

            if (response.ok) {
                router.replace(video ? '/videotheque' + (seance ? '?seance=' + encodeURIComponent(seance) : '') : '/profil')
            } else {
                const data = await response.json()
                setError(data.error || 'Mot de passe incorrect')
            }
        } catch (err) {
            setError('Erreur de connexion')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <ClientOnly fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        }>
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <Link href="/" className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-serif">Retour à la FAQ</span>
                    </Link>

                    <div className="flex justify-center mb-6">
                        <img
                            src="/logo-etu.png"
                            alt="Logo ETU"
                            className="w-16 h-16"
                        />
                    </div>

                    <h2 className="text-center text-3xl font-bold text-gray-900">
                        Accès à la formation à la Kabbale
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 font-serif">
                        École Transcendantaliste Universelle
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-600 text-sm font-serif">{error}</p>
                                </div>
                            )}


                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 font-serif">
                                    Code personnel (4 caractères)
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        autoCapitalize="none" spellCheck={false} minLength={4} maxLength={4} autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                                        placeholder="Votre code"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Connexion...
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-2" />
                                            Se connecter
                                        </div>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 space-y-3 text-center text-sm">
                            <a className="flex min-h-11 w-full items-center justify-center rounded-md bg-[#b01458] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#921047] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b01458]" href={demandeCode()}>Demander un premier code</a>
                            <a className="block underline" href={demandeCode(true)}>Renouveler mon code</a>
                            <p className="text-gray-600">Le code est valable 30 jours.</p>
                        </div>
                    </div>
                </div>
            </div>
        </ClientOnly>
    )
}
