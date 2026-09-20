'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function AccesForm() {
  const searchParams = useSearchParams()
  const [nomSacre, setNomSacre] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const retour = searchParams.get('retour')
  const destination = retour && retour.startsWith('/projets/') ? retour : '/projets/suivi'

  const entrer = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!nomSacre.trim() || envoi) return

    setEnvoi(true)
    setErreur('')
    try {
      const response = await fetch('/api/projets/acces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomSacre }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Accès refusé')
      // Navigation complète : le cookie tout juste posé est pris en compte
      // sans dépendre du cache du routeur.
      window.location.assign(destination)
    } catch (error) {
      setErreur(error instanceof Error ? error.message : 'Accès refusé')
      setEnvoi(false)
    }
  }

  return (
    <form onSubmit={entrer} className="w-full max-w-md">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Comité de suivi</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">Les projets</h1>
      <p className="mt-3 text-base leading-7 text-gray-600">
        Entrez votre nom sacré pour rejoindre le suivi.
      </p>

      <div className="mt-8">
        <label htmlFor="nomSacre" className="block text-base font-medium text-gray-800">
          Nom sacré
        </label>
        <input
          id="nomSacre"
          name="nomSacre"
          type="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          autoFocus
          required
          aria-describedby={erreur ? 'acces-erreur' : undefined}
          aria-invalid={erreur ? true : undefined}
          value={nomSacre}
          onChange={(event) => setNomSacre(event.target.value)}
          className="mt-2 h-14 w-full rounded-xl border border-gray-300 bg-white px-4 text-lg text-gray-950 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
        />
      </div>

      {erreur && (
        <p id="acces-erreur" role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-base text-red-800">
          {erreur}
        </p>
      )}

      <button
        type="submit"
        disabled={envoi || !nomSacre.trim()}
        className="mt-8 h-14 w-full rounded-xl bg-gray-900 text-lg font-medium text-white transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-40"
      >
        {envoi ? 'Ouverture…' : 'Entrer'}
      </button>
    </form>
  )
}

export default function ProjetsAccesPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-gray-50 px-4 py-10 sm:px-6">
      <Suspense fallback={null}>
        <AccesForm />
      </Suspense>
    </main>
  )
}
