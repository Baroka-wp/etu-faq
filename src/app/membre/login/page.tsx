'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, User, Loader2 } from 'lucide-react'

type LoginStep = 'nomSacre' | 'premiereConnexion' | 'motDePasse'

export default function MembreLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<LoginStep>('nomSacre')
  const [nomSacre, setNomSacre] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [confirmMotDePasse, setConfirmMotDePasse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Étape 1 : Vérifier le nom sacré
  const handleNomSacreSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/membre/check-nom-sacre', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nomSacre }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.premiereConnexion) {
          setStep('premiereConnexion')
        } else {
          setStep('motDePasse')
        }
      } else {
        setError(data.error || 'Une erreur est survenue')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  // Étape 2a : Création du mot de passe (première connexion)
  const handlePremiereConnexion = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (motDePasse !== confirmMotDePasse) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (motDePasse.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/membre/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nomSacre, motDePasse }),
      })

      const data = await response.json()

      if (response.ok) {
        // Connexion automatique après création du mot de passe
        router.push('/membre/dashboard')
      } else {
        setError(data.error || 'Une erreur est survenue')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  // Étape 2b : Connexion avec mot de passe existant
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/membre/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nomSacre, motDePasse }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/membre/dashboard')
      } else {
        setError(data.error || 'Une erreur est survenue')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetour = () => {
    setStep('nomSacre')
    setMotDePasse('')
    setConfirmMotDePasse('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base sm:text-lg font-serif">Retour à l'accueil</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img
                src="https://z-cdn-media.chatglm.cn/files/68e00202-7aa7-4b85-a148-a40fdb4ac3f7_logo.png?auth_key=1791497410-4f07e789ecd94c959d996139b8c142b3-0-310a7d57abdef550ba4f1b3ace27306a"
                alt="Logo ETU"
                className="w-20 h-20 sm:w-24 sm:h-24"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 mb-2">
              Espace Membre
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-serif">
              OMP-ETU Bénin
            </p>
          </div>

          {/* Formulaire de connexion */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-serif mb-6">
                {error}
              </div>
            )}

            {/* Info inscription TIGM ; affiché quand le nom sacré n'est pas trouvé */}
            {error && (error.includes('incorrect') || error.includes('inactif')) && (
              <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-4 rounded-lg text-sm font-serif mb-6">
                <p className="mb-3">
                  Si vous êtes membre de l'ETU Bénin, vous pouvez remplir le formulaire d'inscription en ligne pour créer votre espace membre.

                </p>
                <Link
                  href="/members/login"
                  className="inline-block bg-gray-900 hover:bg-black text-white px-5 py-2.5 text-sm font-semibold transition-colors"
                >
                  M'inscrire en ligne
                </Link>
              </div>
            )}

            {/* Étape 1 : Demander le nom sacré */}
            {step === 'nomSacre' && (
              <form onSubmit={handleNomSacreSubmit} className="space-y-6">
                <div>
                  <label htmlFor="nomSacre" className="block text-sm font-serif text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Nom Sacré
                  </label>
                  <input
                    type="text"
                    id="nomSacre"
                    value={nomSacre}
                    onChange={(e) => setNomSacre(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-serif disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Entrez votre nom sacré"
                    autoComplete="username"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-6 py-4 rounded-lg transition-colors text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Vérification...</span>
                    </>
                  ) : (
                    <span>Continuer</span>
                  )}
                </button>
              </form>
            )}

            {/* Étape 2a : Première connexion - Créer le mot de passe */}
            {step === 'premiereConnexion' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm font-serif">
                  Bienvenue <strong>{nomSacre}</strong> ! C'est votre première connexion. Veuillez créer votre mot de passe.
                </div>

                <form onSubmit={handlePremiereConnexion} className="space-y-6">
                  <div>
                    <label htmlFor="motDePasse" className="block text-sm font-serif text-gray-700 mb-2">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      id="motDePasse"
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-serif disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Minimum 6 caractères"
                      autoComplete="new-password"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmMotDePasse" className="block text-sm font-serif text-gray-700 mb-2">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      id="confirmMotDePasse"
                      value={confirmMotDePasse}
                      onChange={(e) => setConfirmMotDePasse(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-serif disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Confirmez votre mot de passe"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleRetour}
                      disabled={isLoading}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 px-6 py-4 rounded-lg transition-colors text-base font-semibold disabled:cursor-not-allowed"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-6 py-4 rounded-lg transition-colors text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Création...</span>
                        </>
                      ) : (
                        <span>Créer et se connecter</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Étape 2b : Connexion standard - Demander le mot de passe */}
            {step === 'motDePasse' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm font-serif">
                  Bonjour <strong>{nomSacre}</strong> ! Veuillez entrer votre mot de passe.
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="motDePasseLogin" className="block text-sm font-serif text-gray-700 mb-2">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      id="motDePasseLogin"
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-serif disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Entrez votre mot de passe"
                      autoComplete="current-password"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleRetour}
                      disabled={isLoading}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 px-6 py-4 rounded-lg transition-colors text-base font-semibold disabled:cursor-not-allowed"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-6 py-4 rounded-lg transition-colors text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Connexion...</span>
                        </>
                      ) : (
                        <span>Se connecter</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Aide */}
            {step === 'motDePasse' && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 font-serif">
                  Mot de passe oublié ?
                </p>
                <p className="text-sm text-gray-500 font-serif mt-1">
                  Contactez l'administrateur au{' '}
                  <a href="tel:+22967153974" className="text-blue-600 hover:text-blue-700 font-semibold">
                    +229 67 15 39 74
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 font-serif">
              Accès réservé aux membres OMP-ETU Bénin
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-600 text-sm font-serif">
            École Transcendantaliste Universelle - Depuis 1977
          </p>
          <p className="text-gray-500 text-xs font-serif mt-1">
            © 2024 ETU Bénin. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
