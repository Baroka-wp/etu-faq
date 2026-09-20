'use client'

import { useId, useState } from 'react'
import { Check, ChevronDown, Trash2 } from 'lucide-react'
import { formatAppDate, formatAppDateYMD } from '@/lib/datetime'
import { TACHE_STATUTS, TACHE_STATUT_LABELS, TacheStatut } from '@/lib/projets'

export type Tache = {
  id: string
  titre: string
  description: string | null
  statut: TacheStatut
  echeance: string | null
  creePar: string | null
  assigne: { id: string; nom: string } | null
  commentaires: number
}

type Commentaire = { id: string; auteur: string; contenu: string; createdAt: string }

const PASTILLE: Record<TacheStatut, string> = {
  a_faire: 'border-gray-300 bg-white',
  en_cours: 'border-gray-900 bg-white ring-2 ring-inset ring-gray-900',
  terminee: 'border-gray-900 bg-gray-900 text-white',
  bloquee: 'border-red-500 bg-red-50',
}

function enRetard(tache: Tache): boolean {
  if (!tache.echeance || tache.statut === 'terminee') return false
  return new Date(tache.echeance).getTime() < Date.now()
}

export default function TacheLigne({
  tache,
  membres,
  isAdmin,
  onChange,
}: {
  tache: Tache
  membres: Array<{ id: string; nom: string }>
  isAdmin: boolean
  onChange: () => Promise<void> | void
}) {
  const panneauId = useId()
  const [ouvert, setOuvert] = useState(false)
  const [commentaires, setCommentaires] = useState<Commentaire[] | null>(null)
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const [occupe, setOccupe] = useState(false)

  const chargerCommentaires = async () => {
    try {
      const response = await fetch(`/api/projets/commentaires?tacheId=${tache.id}`)
      const body = await response.json()
      if (response.ok) setCommentaires(body.commentaires)
    } catch {
      setErreur('Commentaires indisponibles')
    }
  }

  const basculer = async () => {
    const prochain = !ouvert
    setOuvert(prochain)
    if (prochain && commentaires === null) await chargerCommentaires()
  }

  const modifier = async (data: Record<string, unknown>) => {
    setOccupe(true)
    setErreur('')
    try {
      const response = await fetch(`/api/projets/taches/${tache.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error)
      await onChange()
    } catch (error) {
      setErreur(error instanceof Error ? error.message : 'Modification impossible')
    } finally {
      setOccupe(false)
    }
  }

  const commenter = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!message.trim() || occupe) return
    setOccupe(true)
    setErreur('')
    try {
      const response = await fetch('/api/projets/commentaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tacheId: tache.id, contenu: message }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error)
      setMessage('')
      setCommentaires([...(commentaires ?? []), body.commentaire])
      await onChange()
    } catch (error) {
      setErreur(error instanceof Error ? error.message : 'Envoi impossible')
    } finally {
      setOccupe(false)
    }
  }

  const supprimer = async () => {
    if (occupe) return
    setOccupe(true)
    try {
      const response = await fetch(`/api/projets/taches/${tache.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error((await response.json()).error)
      await onChange()
    } catch (error) {
      setErreur(error instanceof Error ? error.message : 'Suppression impossible')
      setOccupe(false)
    }
  }

  const retard = enRetard(tache)

  return (
    <li className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={basculer}
        aria-expanded={ouvert}
        aria-controls={panneauId}
        className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gray-900"
      >
        <span
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${PASTILLE[tache.statut]}`}
          aria-hidden
        >
          {tache.statut === 'terminee' && <Check className="h-4 w-4" />}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={`block text-base font-medium leading-7 ${tache.statut === 'terminee' ? 'text-gray-500 line-through' : 'text-gray-950'}`}
          >
            {tache.titre}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
            <span>{TACHE_STATUT_LABELS[tache.statut]}</span>
            {tache.assigne && <span>· {tache.assigne.nom}</span>}
            {tache.echeance && (
              <span className={retard ? 'font-medium text-red-700' : undefined}>
                · {retard ? 'échu le ' : 'pour le '}
                {formatAppDate(tache.echeance, { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
            {tache.commentaires > 0 && (
              <span>· {tache.commentaires} commentaire{tache.commentaires > 1 ? 's' : ''}</span>
            )}
          </span>
        </span>

        <ChevronDown
          className={`mt-1 h-5 w-5 shrink-0 text-gray-400 transition-transform ${ouvert ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {ouvert && (
        <div id={panneauId} className="space-y-6 border-t border-gray-200 p-4">
          {tache.description && (
            <p className="text-base leading-7 text-gray-700">{tache.description}</p>
          )}

          {isAdmin ? (
            <fieldset>
              <legend className="text-sm font-semibold uppercase tracking-wide text-gray-500">Avancement</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {TACHE_STATUTS.map((statut) => (
                  <button
                    key={statut}
                    type="button"
                    disabled={occupe}
                    aria-pressed={statut === tache.statut}
                    onClick={() => modifier({ statut })}
                    className={`h-11 rounded-xl border px-4 text-base transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-40 ${
                      statut === tache.statut
                        ? 'border-gray-900 bg-gray-900 font-medium text-white'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {TACHE_STATUT_LABELS[statut]}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : (
            <p className="text-sm leading-6 text-gray-600">
              L’avancement est tenu par l’administrateur.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${panneauId}-assigne`} className="block text-base font-medium text-gray-800">
                Confiée à
              </label>
              <select
                id={`${panneauId}-assigne`}
                value={tache.assigne?.id ?? ''}
                disabled={occupe}
                onChange={(event) => modifier({ assigneId: event.target.value })}
                className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-950 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 disabled:opacity-40"
              >
                <option value="">Personne</option>
                {membres.map((membre) => (
                  <option key={membre.id} value={membre.id}>{membre.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${panneauId}-echeance`} className="block text-base font-medium text-gray-800">
                Délai
              </label>
              <input
                id={`${panneauId}-echeance`}
                type="date"
                disabled={occupe}
                value={tache.echeance ? formatAppDateYMD(tache.echeance) : ''}
                onChange={(event) => modifier({ echeance: event.target.value })}
                className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-950 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 disabled:opacity-40"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Commentaires</h3>
            {commentaires && commentaires.length > 0 && (
              <ul className="mt-3 space-y-3">
                {commentaires.map((commentaire) => (
                  <li key={commentaire.id} className="rounded-xl bg-gray-50 p-4">
                    <p className="text-base leading-7 text-gray-800">{commentaire.contenu}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {commentaire.auteur} · {formatAppDate(commentaire.createdAt, { day: 'numeric', month: 'long' })}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={commenter} className="mt-3 flex flex-col gap-3 sm:flex-row">
              <label htmlFor={`${panneauId}-mot`} className="sr-only">Ajouter un commentaire</label>
              <input
                id={`${panneauId}-mot`}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ajouter un mot"
                maxLength={2000}
                enterKeyHint="send"
                className="h-12 flex-1 rounded-xl border border-gray-300 px-4 text-base text-gray-950 placeholder:text-gray-500 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
              />
              <button
                type="submit"
                disabled={occupe || !message.trim()}
                className="h-12 rounded-xl bg-gray-900 px-6 text-base font-medium text-white transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-40"
              >
                Envoyer
              </button>
            </form>
          </div>

          {erreur && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-base text-red-800">{erreur}</p>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600">{tache.creePar ? `Proposée par ${tache.creePar}` : ''}</p>
            {isAdmin && (
              <button
                type="button"
                onClick={supprimer}
                disabled={occupe}
                className="flex h-11 items-center gap-2 rounded-xl px-3 text-base text-gray-600 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-40"
              >
                <Trash2 className="h-5 w-5" aria-hidden />
                Retirer
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  )
}
