'use client'

import type { Book, CoursVideo } from '@prisma/client'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Formulaire({ cours, ressources }: {
  cours?: CoursVideo & { ressources: { id: string }[] }
  ressources: Pick<Book, 'id' | 'title' | 'isFree' | 'price' | 'publie'>[]
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [publie, setPublie] = useState('')
  const [selection, setSelection] = useState(() => cours?.ressources.map(r => r.id) ?? [])
  const [recherche, setRecherche] = useState('')
  const catalogue = ressources.filter(r => r.title.toLocaleLowerCase('fr').includes(recherche.trim().toLocaleLowerCase('fr')))
  const champ = 'mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base font-normal focus:outline-[#831843]'
  async function enregistrer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setBusy(true)
    setMessage('')
    setPublie('')
    try {
      const res = await fetch('/api/admin/videotheque', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(data), id: cours?.id, ressourceIds: selection, presentiel: data.has('presentiel') }) })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      setMessage('Cours enregistré.')
      setPublie(result.id)
      if (!cours) {
        form.reset()
        setSelection([])
        setRecherche('')
      }
      router.refresh()
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Enregistrement impossible.') }
    finally { setBusy(false) }
  }
  return <form onSubmit={enregistrer} className="mx-auto max-w-4xl space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-2xl font-semibold">{cours ? 'Modifier le cours' : 'Ajouter un cours'}</h2>
      <Link href="/admin/videotheque" className="text-sm text-gray-600 underline">Retour à la liste</Link>
    </div>
    <section className="space-y-5 rounded-xl border bg-white p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <label className="text-sm font-medium">Titre du cours<input className={champ} name="titre" required maxLength={200} defaultValue={cours?.titre} /></label>
        <label className="text-sm font-medium">Date de la séance<input type="date" className={champ} name="date" required defaultValue={cours?.date} /></label>
      </div>
      <label className="block text-sm font-medium">Lien de la vidéo Google Drive
        <input type="url" className={champ} aria-describedby="aide-drive" name="lien" required placeholder="https://drive.google.com/…" defaultValue={cours && 'https://drive.google.com/file/d/'+cours.driveId+'/view'} />
        <span id="aide-drive" className="mt-1 block text-xs font-normal text-gray-600">Dans Drive, autorisez la lecture à toute personne disposant du lien.</span>
      </label>
      <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-[#831843]" name="presentiel" defaultChecked={cours?.presentiel} /> Séance en présentiel</label>
      <label className="block text-sm font-medium">Notes et exercices <span className="font-normal text-gray-500">(facultatif)</span>
        <textarea className={champ} rows={5} name="notes" maxLength={20000} defaultValue={cours?.notes} />
      </label>
    </section>
    <section className="space-y-3 rounded-xl border bg-white p-5 sm:p-6">
      <h3 className="text-lg font-semibold">Ressources du cours</h3>
      {selection.length ? <ul className="flex flex-wrap gap-2">{ressources.filter(r => selection.includes(r.id)).map(r =>
        <li key={r.id} className="rounded-lg bg-pink-50 px-3 py-1.5 text-sm text-[#831843]">{r.title}</li>
      )}</ul> : <p className="text-sm text-gray-600">Aucune ressource associée.</p>}
      <details>
        <summary className="cursor-pointer py-2 text-sm font-medium text-[#831843]">Choisir les ressources</summary>
        <input type="search" aria-label="Rechercher une ressource" placeholder="Rechercher par titre…" value={recherche} onChange={e => setRecherche(e.target.value)} className={champ} />
        <div className="my-3 max-h-60 divide-y overflow-y-auto">
          {!catalogue.length && <p className="py-3 text-sm">Aucune ressource trouvée.</p>}
          {catalogue.map(r => <label key={r.id} className="flex cursor-pointer items-center gap-3 py-3 text-sm">
            <input type="checkbox" className="size-4 shrink-0 accent-[#831843]" checked={selection.includes(r.id)}
              onChange={e => setSelection(e.target.checked ? [...selection, r.id] : selection.filter(id => id !== r.id))} />
            <span className="flex-1">{r.title}{!r.publie && ' · Brouillon'}</span>
            <span className="text-xs text-gray-600">{r.isFree ? 'Gratuit' : r.price ? r.price.toLocaleString('fr-FR') + ' FCFA' : 'Payant'}</span>
          </label>)}
        </div>
        <Link href="/admin/enseignements?onglet=ressources" target="_blank" className="text-sm underline">Gérer les ressources et leurs tarifs</Link>
      </details>
    </section>
    <div className="sticky bottom-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-3 shadow-md">
      <p role="status" className="text-sm">{message} {publie && <a className="underline" href={'/videotheque?seance='+publie}>Voir la séance</a>}</p>
      <button disabled={busy} className="ml-auto rounded-lg bg-[#831843] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">{busy ? 'Enregistrement…' : cours ? 'Enregistrer les modifications' : 'Publier le cours'}</button>
    </div>
  </form>
}
