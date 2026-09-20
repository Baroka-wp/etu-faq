'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ComiteShell, { ComiteMembre } from '@/components/projets/ComiteShell'
import Avancement from '@/components/projets/Avancement'
import TacheLigne, { Tache } from '@/components/projets/TacheLigne'
import { formatAppDate } from '@/lib/datetime'
import { PROJET_STATUTS, PROJET_STATUT_LABELS, ProjetStatut } from '@/lib/projets'

type Commentaire = { id: string; auteur: string; contenu: string; createdAt: string }

type Projet = {
  id: string
  titre: string
  resume: string | null
  description: string | null
  statut: ProjetStatut
  proposePar: string | null
  avancement: number
  tachesTerminees: number
  taches: Tache[]
  commentaires: Commentaire[]
}

export default function ProjetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [membre, setMembre] = useState<ComiteMembre | null>(null)
  const [membres, setMembres] = useState<Array<{ id: string; nom: string }>>([])
  const [projet, setProjet] = useState<Projet | null>(null)
  const [erreur, setErreur] = useState('')
  const [occupe, setOccupe] = useState(false)

  const [formOuvert, setFormOuvert] = useState(false)
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [assigneId, setAssigneId] = useState('')
  const [echeance, setEcheance] = useState('')
  const [mot, setMot] = useState('')

  const chargerProjet = useCallback(async () => {
    const response = await fetch(`/api/projets/${id}`)
    if (response.status === 401) {
      router.push('/projets')
      return
    }
    const body = await response.json()
    if (!response.ok) throw new Error(body.error)
    setProjet(body.projet)
  }, [id, router])

  useEffect(() => {
    const charger = async () => {
      try {
        const [meResponse, membresResponse] = await Promise.all([
          fetch('/api/projets/me'),
          fetch('/api/projets/membres'),
        ])
        if (meResponse.status === 401) {
          router.push('/projets')
          return
        }
        setMembre((await meResponse.json()).membre)
        setMembres((await membresResponse.json()).membres ?? [])
        await chargerProjet()
      } catch (error) {
        setErreur(error instanceof Error ? error.message : 'Chargement impossible')
      }
    }
    void charger()
  }, [chargerProjet, router])

  const ajouterTache = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!titre.trim() || occupe) return
    setOccupe(true)
    setErreur('')
    try {
      const response = await fetch(`/api/projets/${id}/taches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre, description, assigneId, echeance }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error)
      setTitre('')
      setDescription('')
      setAssigneId('')
      setEcheance('')
      setFormOuvert(false)
      await chargerProjet()
    } catch (error) {
      setErreur(error instanceof Error ? error.message : 'Ajout impossible')
    } finally {
      setOccupe(false)
    }
  }

  const changerStatut = async (statut: ProjetStatut) => {
    setOccupe(true)
    setErreur('')
    try {
      const response = await fetch(`/api/projets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut }),
      })
      if (!response.ok) throw new Error((await response.json()).error)
      await chargerProjet()
    } catch (error) {
      setErreur(error instanceof Error ? error.message : 'Modification impossible')
    } finally {
      setOccupe(false)
    }
  }

  const commenterProjet = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!mot.trim() || occupe) return
    setOccupe(true)
    setErreur('')
    try {
      const response = await fetch('/api/projets/commentaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projetId: id, contenu: mot }),
      })
      if (!response.ok) throw new Error((await response.json()).error)
      setMot('')
      await chargerProjet()
    } catch (error) {
      setErreur(error instanceof Error ? error.message : 'Envoi impossible')
    } finally {
      setOccupe(false)
    }
  }

  return (
    <ComiteShell membre={membre}>
      <Link href="/projets/suivi" className="text-xs text-stone-400 transition hover:text-stone-700">
        ← Tous les projets
      </Link>

      {erreur && <p className="mt-6 text-sm text-red-700">{erreur}</p>}

      {!projet ? (
        <p className="mt-16 text-sm text-stone-300">Ouverture…</p>
      ) : (
        <>
          <header className="mt-8">
            <h1 className="text-3xl font-light leading-tight tracking-tight">{projet.titre}</h1>
            {projet.resume && (
              <p className="mt-3 max-w-xl font-serif text-[15px] leading-relaxed text-stone-500">{projet.resume}</p>
            )}
            {projet.description && (
              <p className="mt-4 max-w-xl whitespace-pre-line font-serif text-[15px] leading-relaxed text-stone-600">
                {projet.description}
              </p>
            )}

            <div className="mt-8">
              <Avancement
                valeur={projet.avancement}
                legende={
                  projet.taches.length === 0
                    ? 'Aucune tâche pour l’instant'
                    : `${projet.tachesTerminees} sur ${projet.taches.length} tâches · ${projet.avancement}%`
                }
              />
            </div>

            {membre?.isAdmin ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {PROJET_STATUTS.map((statut) => (
                  <button
                    key={statut}
                    type="button"
                    disabled={occupe || statut === projet.statut}
                    onClick={() => changerStatut(statut)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
                      statut === projet.statut
                        ? 'border-stone-900 bg-stone-900 text-stone-50'
                        : 'border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900'
                    }`}
                  >
                    {PROJET_STATUT_LABELS[statut]}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-xs uppercase tracking-[0.2em] text-stone-400">
                {PROJET_STATUT_LABELS[projet.statut]}
                {projet.proposePar && ` · proposé par ${projet.proposePar}`}
              </p>
            )}
          </header>

          <section className="mt-12">
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-stone-400">Tâches</h2>
            <ul className="mt-4 border-t border-stone-200/80">
              {projet.taches.map((tache) => (
                <TacheLigne
                  key={tache.id}
                  tache={tache}
                  membres={membres}
                  isAdmin={Boolean(membre?.isAdmin)}
                  onChange={chargerProjet}
                />
              ))}
              {projet.taches.length === 0 && (
                <li className="py-8 font-serif text-[15px] text-stone-400">
                  Rien n’est encore inscrit. La première tâche vous revient.
                </li>
              )}
            </ul>

            <div className="mt-6">
              {!formOuvert ? (
                <button
                  type="button"
                  onClick={() => setFormOuvert(true)}
                  className="text-sm text-stone-500 transition hover:text-stone-900"
                >
                  + Ajouter une tâche
                </button>
              ) : (
                <form onSubmit={ajouterTache} className="space-y-5 border-t border-stone-200 pt-6">
                  <input
                    type="text"
                    value={titre}
                    onChange={(event) => setTitre(event.target.value)}
                    placeholder="Que faut-il faire ?"
                    maxLength={200}
                    autoFocus
                    className="w-full border-0 border-b border-stone-300 bg-transparent pb-2 text-[15px] placeholder:text-stone-300 focus:border-stone-900 focus:outline-none focus:ring-0"
                  />
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Précisions (facultatif)"
                    rows={2}
                    maxLength={2000}
                    className="w-full resize-none border-0 border-b border-stone-200 bg-transparent pb-2 font-serif text-[15px] leading-relaxed placeholder:text-stone-300 focus:border-stone-900 focus:outline-none focus:ring-0"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-stone-400">Confiée à</span>
                      <select
                        value={assigneId}
                        onChange={(event) => setAssigneId(event.target.value)}
                        className="mt-2 w-full border-0 border-b border-stone-200 bg-transparent pb-2 text-sm focus:border-stone-900 focus:outline-none focus:ring-0"
                      >
                        <option value="">Personne</option>
                        {membres.map((personne) => (
                          <option key={personne.id} value={personne.id}>{personne.nom}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-stone-400">Délai</span>
                      <input
                        type="date"
                        value={echeance}
                        onChange={(event) => setEcheance(event.target.value)}
                        className="mt-2 w-full border-0 border-b border-stone-200 bg-transparent pb-2 text-sm focus:border-stone-900 focus:outline-none focus:ring-0"
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-5">
                    <button
                      type="submit"
                      disabled={occupe || !titre.trim()}
                      className="rounded-full bg-stone-900 px-6 py-2.5 text-sm text-stone-50 transition hover:bg-stone-700 disabled:opacity-30"
                    >
                      Inscrire
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormOuvert(false)}
                      className="text-sm text-stone-400 transition hover:text-stone-700"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          <section className="mt-16 border-t border-stone-200 pt-8">
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-stone-400">Échanges sur le projet</h2>
            {projet.commentaires.length > 0 && (
              <ul className="mt-6 space-y-4">
                {projet.commentaires.map((commentaire) => (
                  <li key={commentaire.id} className="border-l border-stone-200 pl-4">
                    <p className="font-serif text-[15px] leading-relaxed text-stone-700">{commentaire.contenu}</p>
                    <p className="mt-1 text-xs text-stone-400">
                      {commentaire.auteur} · {formatAppDate(commentaire.createdAt, { day: 'numeric', month: 'long' })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={commenterProjet} className="mt-6 flex items-end gap-3">
              <input
                type="text"
                value={mot}
                onChange={(event) => setMot(event.target.value)}
                placeholder="Ajouter un mot"
                maxLength={2000}
                className="flex-1 border-0 border-b border-stone-200 bg-transparent pb-2 text-sm placeholder:text-stone-300 focus:border-stone-900 focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                disabled={occupe || !mot.trim()}
                className="pb-2 text-sm text-stone-500 transition hover:text-stone-900 disabled:opacity-30"
              >
                Envoyer
              </button>
            </form>
          </section>
        </>
      )}
    </ComiteShell>
  )
}
