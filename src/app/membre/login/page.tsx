'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, User, Loader2 } from 'lucide-react'

export default function MembreLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nomSacre: '',
    motDePasse: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/membre/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Rediriger vers le dashboard
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-serif">
                  {error}
                </div>
              )}

              {/* Nom Sacré */}
              <div>
                <label htmlFor="nomSacre" className="block text-sm font-serif text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nom Sacré
                </label>
                <input
                  type="text"
                  id="nomSacre"
                  name="nomSacre"
                  value={formData.nomSacre}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-serif disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Votre nom sacré"
                  autoComplete="username"
                />
              </div>

              {/* Mot de passe */}
              <div>
                <label htmlFor="motDePasse" className="block text-sm font-serif text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="motDePasse"
                  name="motDePasse"
                  value={formData.motDePasse}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-serif disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Votre mot de passe"
                  autoComplete="current-password"
                />
              </div>

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-6 py-4 rounded-lg transition-colors text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <span>Se connecter</span>
                )}
              </button>
            </form>

            {/* Aide */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 font-serif">
                Première connexion ou mot de passe oublié ?
              </p>
              <p className="text-sm text-gray-500 font-serif mt-1">
                Contactez l'administrateur au{' '}
                <a href="tel:+22967153974" className="text-blue-600 hover:text-blue-700 font-semibold">
                  +229 67 15 39 74
                </a>
              </p>
            </div>
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
