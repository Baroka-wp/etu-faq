'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AccesForm() {
  const router = useRouter()
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
      router.push(destination)
      router.refresh()
    } catch (error) {
      setErreur(error instanceof Error ? error.message : 'Accès refusé')
      setEnvoi(false)
    }
  }

  return (
    <form onSubmit={entrer} className="w-full max-w-sm">
      <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400">Comité de suivi</p>
      <h1 className="mt-4 text-3xl font-light tracking-tight text-stone-900">Les projets</h1>
      <p className="mt-3 font-serif text-[15px] leading-relaxed text-stone-500">
        Entrez votre nom sacré pour rejoindre le suivi.
      </p>

      <label htmlFor="nomSacre" className="sr-only">Nom sacré</label>
      <input
        id="nomSacre"
        type="text"
        autoComplete="off"
        autoFocus
        value={nomSacre}
        onChange={(event) => setNomSacre(event.target.value)}
        placeholder="Nom sacré"
        className="mt-8 w-full border-0 border-b border-stone-300 bg-transparent pb-3 text-lg text-stone-900 placeholder:text-stone-300 focus:border-stone-900 focus:outline-none focus:ring-0"
      />

      {erreur && <p className="mt-4 text-sm text-red-700">{erreur}</p>}

      <button
        type="submit"
        disabled={envoi || !nomSacre.trim()}
        className="mt-8 w-full rounded-full bg-stone-900 py-3 text-sm tracking-wide text-stone-50 transition hover:bg-stone-700 disabled:opacity-30"
      >
        {envoi ? 'Ouverture…' : 'Entrer'}
      </button>
    </form>
  )
}

export default function ProjetsAccesPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#faf9f5] px-6">
      <Suspense fallback={null}>
        <AccesForm />
      </Suspense>
    </main>
  )
}
