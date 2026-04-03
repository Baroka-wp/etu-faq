'use client'

import { X, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface UpdateInfoBannerProps {
  membre: {
    email: string
    telephoneWhatsapp: string
  }
}

export default function UpdateInfoBanner({ membre }: UpdateInfoBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  // Vérifier si l'email est un email par défaut (membre@etufaq.com)
  const hasDefaultEmail = membre.email?.includes('@etufaq.com') || !membre.email
  const hasPhone = membre.telephoneWhatsapp && membre.telephoneWhatsapp.trim() !== ''

  // Ne rien afficher si les informations sont complètes
  if (!hasDefaultEmail && hasPhone) {
    return null
  }

  // Ne rien afficher si l'utilisateur a fermé la bannière
  if (!isVisible) {
    return null
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm font-serif text-amber-900">
              {hasDefaultEmail && !hasPhone && (
                <>
                  <span className="font-semibold">Informations incomplètes :</span> Veuillez mettre à jour votre email et votre numéro de téléphone.
                </>
              )}
              {hasDefaultEmail && hasPhone && (
                <>
                  <span className="font-semibold">Email non renseigné :</span> Veuillez mettre à jour votre adresse email.
                </>
              )}
              {!hasDefaultEmail && !hasPhone && (
                <>
                  <span className="font-semibold">Téléphone manquant :</span> Veuillez ajouter votre numéro de téléphone.
                </>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/membre/profil"
              className="text-sm font-semibold text-amber-900 hover:text-amber-700 underline whitespace-nowrap font-serif"
            >
              Mettre à jour
            </Link>
            <button
              onClick={() => setIsVisible(false)}
              className="text-amber-600 hover:text-amber-800 p-1"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
