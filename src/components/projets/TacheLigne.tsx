'use client'

import { useState } from 'react'
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

const MARQUEUR: Record<TacheStatut, string> = {
  a_faire: 'border-stone-300',
  en_cours: 'border-stone-900 border-l-[5px]',
  terminee: 'border-stone-900 bg-stone-900',
  bloquee: 'border-red-400 border-dashed',
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
    <li className="border-b border-stone-200/80 last:border-b-0">
      <button
        type="button"
        onClick={basculer}
        className="flex w-full items-start gap-4 py-4 text-left transition hover:opacity-70"
        aria-expanded={ouvert}
      >
        <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full border ${MARQUEUR[tache.statut]}`} aria-hidden />
        <span className="min-w-0 flex-1">
          <span
            className={`block text-[15px] leading-6 ${tache.statut === 'terminee' ? 'text-stone-400 line-through decoration-stone-300' : 'text-stone-900'}`}
          >
            {tache.titre}
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-400">
            <span>{TACHE_STATUT_LABELS[tache.statut]}</span>
            {tache.assigne && <span>· {tache.assigne.nom}</span>}
            {tache.echeance && (
              <span className={retard ? 'text-red-600' : undefined}>
                · {retard ? 'échu le ' : 'pour le '}
                {formatAppDate(tache.echeance, { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
            {tache.commentaires > 0 && <span>· {tache.commentaires} mot(s)</span>}
          </span>
        </span>
      </button>

      {ouvert && (
        <div className="space-y-6 pb-8 pl-7 pr-1">
          {tache.description && (
            <p className="font-serif text-[15px] leading-relaxed text-stone-600">{tache.description}</p>
          )}

          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              {TACHE_STATUTS.map((statut) => (
                <button
                  key={statut}
                  type="button"
                  disabled={occupe || statut === tache.statut}
                  onClick={() => modifier({ statut })}
                  className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
                    statut === tache.statut
                      ? 'border-stone-900 bg-stone-900 text-stone-50'
                      : 'border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900'
                  }`}
                >
                  {TACHE_STATUT_LABELS[statut]}
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-stone-400">Confiée à</span>
              <select
                value={tache.assigne?.id ?? ''}
                disabled={occupe}
                onChange={(event) => modifier({ assigneId: event.target.value })}
                className="mt-2 w-full border-0 border-b border-stone-200 bg-transparent pb-2 text-sm text-stone-800 focus:border-stone-900 focus:outline-none focus:ring-0"
              >
                <option value="">Personne</option>
                {membres.map((membre) => (
                  <option key={membre.id} value={membre.id}>{membre.nom}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-stone-400">Délai</span>
              <input
                type="date"
                disabled={occupe}
                value={tache.echeance ? formatAppDateYMD(tache.echeance) : ''}
                onChange={(event) => modifier({ echeance: event.target.value })}
                className="mt-2 w-full border-0 border-b border-stone-200 bg-transparent pb-2 text-sm text-stone-800 focus:border-stone-900 focus:outline-none focus:ring-0"
              />
            </label>
          </div>

          <div>
            {commentaires && commentaires.length > 0 && (
              <ul className="mb-4 space-y-3">
                {commentaires.map((commentaire) => (
                  <li key={commentaire.id} className="border-l border-stone-200 pl-4">
                    <p className="font-serif text-[15px] leading-relaxed text-stone-700">{commentaire.contenu}</p>
                    <p className="mt-1 text-xs text-stone-400">
                      {commentaire.auteur} · {formatAppDate(commentaire.createdAt, { day: 'numeric', month: 'long' })}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={commenter} className="flex items-end gap-3">
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ajouter un mot"
                maxLength={2000}
                className="flex-1 border-0 border-b border-stone-200 bg-transparent pb-2 text-sm placeholder:text-stone-300 focus:border-stone-900 focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                disabled={occupe || !message.trim()}
                className="pb-2 text-sm text-stone-500 transition hover:text-stone-900 disabled:opacity-30"
              >
                Envoyer
              </button>
            </form>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>{tache.creePar ? `Proposée par ${tache.creePar}` : ''}</span>
            {isAdmin && (
              <button type="button" onClick={supprimer} disabled={occupe} className="transition hover:text-red-700">
                Retirer la tâche
              </button>
            )}
          </div>

          {erreur && <p className="text-sm text-red-700">{erreur}</p>}
        </div>
      )}
    </li>
  )
}
