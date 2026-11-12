'use client'

import { useState } from 'react'
import { KeyRound, Lock, UserRound } from 'lucide-react'

/**
 * Porte d'entrée d'une ressource ou d'une collection réservée.
 * Le code est proposé en premier ; les membres passent par le lien du bas.
 */
export default function PorteAcces({
  titre = 'Ressource réservée',
  gradesAutorises = [],
  lecteurConnu,
  onOuvert,
}: {
  titre?: string
  gradesAutorises?: string[]
  lecteurConnu?: string | null
  onOuvert: () => void | Promise<void>
}) {
  const [mode, setMode] = useState<'code' | 'nomSacre'>('code')
  const [saisie, setSaisie] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const ouvrir = async (evenement: React.FormEvent) => {
    evenement.preventDefault()
    if (!saisie.trim() || envoi) return
    setEnvoi(true)
    setErreur('')
    try {
      const reponse = await fetch('/api/acces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'nomSacre' ? { nomSacre: saisie } : { code: saisie }),
      })
      const corps = await reponse.json()
      if (!reponse.ok) throw new Error(corps.error)
      setSaisie('')
      await onOuvert()
    } catch (erreurOuverture) {
      setErreur(erreurOuverture instanceof Error ? erreurOuverture.message : 'Accès refusé')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-950">
        <Lock className="h-5 w-5 text-gray-400" aria-hidden /> {titre}
      </h2>
      <p className="mt-2 text-base leading-7 text-gray-600">
        {mode === 'code' ? 'Entrez le code qui vous a été remis.' : 'Entrez votre nom sacré.'}
      </p>

      <form onSubmit={ouvrir} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="porte-acces" className="sr-only">
          {mode === 'code' ? 'Votre code' : 'Votre nom sacré'}
        </label>
        <input
          id="porte-acces"
          value={saisie}
          onChange={(evenement) => setSaisie(evenement.target.value)}
          placeholder={mode === 'code' ? 'Code à 8 caractères' : 'Nom sacré'}
          autoComplete="off"
          autoCapitalize={mode === 'code' ? 'characters' : 'none'}
          autoFocus
          className={`h-12 flex-1 rounded-xl border border-gray-300 px-4 text-base text-gray-950 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 ${
            mode === 'code' ? 'font-mono uppercase tracking-widest' : ''
          }`}
        />
        <button
          type="submit"
          disabled={envoi || !saisie.trim()}
          className="h-12 rounded-xl bg-gray-900 px-6 text-base font-medium text-white transition hover:bg-gray-800 disabled:opacity-40"
        >
          {envoi ? 'Vérification…' : 'Ouvrir'}
        </button>
      </form>

      {erreur && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-base text-red-800">
          {erreur}
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          setMode(mode === 'code' ? 'nomSacre' : 'code')
          setErreur('')
          setSaisie('')
        }}
        className="mt-5 inline-flex items-center gap-2 text-sm text-gray-500 underline underline-offset-4 transition hover:text-gray-900"
      >
        {mode === 'code' ? (
          <>
            <UserRound className="h-4 w-4" aria-hidden /> Je suis membre
          </>
        ) : (
          <>
            <KeyRound className="h-4 w-4" aria-hidden /> J’ai un code
          </>
        )}
      </button>

      {lecteurConnu && (
        <p className="mt-4 text-sm text-gray-500">
          Vous êtes reconnu comme {lecteurConnu}, mais cette ressource ne vous est pas ouverte.
        </p>
      )}
      {gradesAutorises.length > 0 && (
        <p className="mt-2 text-sm text-gray-500">Réservée aux grades : {gradesAutorises.join(', ')}.</p>
      )}
    </section>
  )
}
