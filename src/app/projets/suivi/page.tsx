'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ComiteShell, { ComiteMembre } from '@/components/projets/ComiteShell'
import Avancement from '@/components/projets/Avancement'
import { PROJET_STATUT_LABELS, ProjetStatut } from '@/lib/projets'

type ProjetResume = {
  id: string
  titre: string
  resume: string | null
  statut: ProjetStatut
  proposePar: string | null
  taches: number
  tachesTerminees: number
  avancement: number
  commentaires: number
}

export default function ProjetsPage() {
  const router = useRouter()
  const [membre, setMembre] = useState<ComiteMembre | null>(null)
  const [projets, setProjets] = useState<ProjetResume[] | null>(null)
  const [erreur, setErreur] = useState('')
  const [formOuvert, setFormOuvert] = useState(false)
  const [titre, setTitre] = useState('')
  const [resume, setResume] = useState('')
  const [description, setDescription] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const charger = useCallback(async () => {
    try {
      const [meResponse, projetsResponse] = await Promise.all([
        fetch('/api/projets/me'),
        fetch('/api/projets'),
      ])
      if (meResponse.status === 401 || projetsResponse.status === 401) {
        router.push('/projets')
        return
      }
      const me = await meResponse.json()
      const liste = await projetsResponse.json()
      if (!projetsResponse.ok) throw new Error(liste.error)
      setMembre(me.membre)
      setProjets(liste.projets)
    } catch (error) {
      setErreur(error instanceof Error ? error.message : 'Chargement impossible')
    }
  }, [router])

  useEffect(() => {
    void charger()
  }, [charger])

  const suggerer = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!titre.trim() || envoi) return

    setEnvoi(true)
    setErreur('')
    try {
      const response = await fetch('/api/projets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre, resume, description }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error)
      setTitre('')
      setResume('')
      setDescription('')
      setFormOuvert(false)
      await charger()
    } catch (error) {
      setErreur(error instanceof Error ? error.message : 'Enregistrement impossible')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <ComiteShell membre={membre}>
      <h1 className="text-3xl font-light tracking-tight">Les projets</h1>
      <p className="mt-3 max-w-xl font-serif text-[15px] leading-relaxed text-stone-500">
        Nous ne soumettons pas de propositions : nous suivons, et nous agissons.
      </p>

      {erreur && <p className="mt-6 text-sm text-red-700">{erreur}</p>}

      {!projets ? (
        <p className="mt-16 text-sm text-stone-300">Ouverture…</p>
      ) : (
        <ul className="mt-12 space-y-px">
          {projets.map((projet) => (
            <li key={projet.id}>
              <Link
                href={`/projets/suivi/${projet.id}`}
                className="-mx-4 block rounded-lg px-4 py-6 transition hover:bg-stone-100/70"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-lg font-normal tracking-tight text-stone-900">{projet.titre}</h2>
                  {projet.statut !== 'en_cours' && (
                    <span className="shrink-0 text-[11px] uppercase tracking-[0.2em] text-stone-400">
                      {PROJET_STATUT_LABELS[projet.statut]}
                    </span>
                  )}
                </div>
                {projet.resume && (
                  <p className="mt-2 font-serif text-[15px] leading-relaxed text-stone-500">{projet.resume}</p>
                )}
                <div className="mt-5">
                  <Avancement
                    valeur={projet.avancement}
                    legende={
                      projet.taches === 0
                        ? 'Aucune tâche pour l’instant'
                        : `${projet.tachesTerminees} sur ${projet.taches} tâches`
                    }
                  />
                </div>
              </Link>
            </li>
          ))}

          {projets.length === 0 && (
            <li className="py-10 font-serif text-[15px] text-stone-400">Aucun projet suivi pour l’instant.</li>
          )}
        </ul>
      )}

      <section className="mt-16 border-t border-stone-200 pt-8">
        {!formOuvert ? (
          <button
            type="button"
            onClick={() => setFormOuvert(true)}
            className="text-sm text-stone-500 transition hover:text-stone-900"
          >
            + Suggérer un projet
          </button>
        ) : (
          <form onSubmit={suggerer} className="space-y-5">
            <h2 className="text-sm uppercase tracking-[0.2em] text-stone-400">Nouveau projet</h2>
            <input
              type="text"
              value={titre}
              onChange={(event) => setTitre(event.target.value)}
              placeholder="Titre"
              maxLength={160}
              autoFocus
              className="w-full border-0 border-b border-stone-300 bg-transparent pb-2 text-lg placeholder:text-stone-300 focus:border-stone-900 focus:outline-none focus:ring-0"
            />
            <input
              type="text"
              value={resume}
              onChange={(event) => setResume(event.target.value)}
              placeholder="En une phrase"
              maxLength={300}
              className="w-full border-0 border-b border-stone-200 bg-transparent pb-2 font-serif text-[15px] placeholder:text-stone-300 focus:border-stone-900 focus:outline-none focus:ring-0"
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ce qu'il faut accomplir (facultatif)"
              rows={4}
              maxLength={4000}
              className="w-full resize-none border-0 border-b border-stone-200 bg-transparent pb-2 font-serif text-[15px] leading-relaxed placeholder:text-stone-300 focus:border-stone-900 focus:outline-none focus:ring-0"
            />
            <div className="flex items-center gap-5">
              <button
                type="submit"
                disabled={envoi || !titre.trim()}
                className="rounded-full bg-stone-900 px-6 py-2.5 text-sm text-stone-50 transition hover:bg-stone-700 disabled:opacity-30"
              >
                {envoi ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => setFormOuvert(false)}
                className="text-sm text-stone-400 transition hover:text-stone-700"
              >
                Annuler
              </button>
            </div>
            {membre && !membre.isAdmin && (
              <p className="text-xs text-stone-400">
                Votre projet apparaîtra comme proposé, en attente d’ouverture par l’administrateur.
              </p>
            )}
          </form>
        )}
      </section>
    </ComiteShell>
  )
}
