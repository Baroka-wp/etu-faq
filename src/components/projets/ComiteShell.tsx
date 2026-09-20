'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export type ComiteMembre = {
  id: string
  nom: string
  prenoms: string
  nomSacre: string | null
  isAdmin: boolean
}

/** Cadre commun de l'espace projets : une barre discrète, puis le contenu. */
export default function ComiteShell({
  membre,
  children,
}: {
  membre: ComiteMembre | null
  children: React.ReactNode
}) {
  const router = useRouter()

  const sortir = async () => {
    await fetch('/api/projets/logout', { method: 'POST' })
    router.push('/projets')
    router.refresh()
  }

  return (
    <div className="min-h-dvh bg-[#faf9f5] text-stone-900">
      <header className="border-b border-stone-200/80">
        <div className="mx-auto flex max-w-3xl items-baseline justify-between gap-4 px-6 py-5">
          <Link href="/projets/suivi" className="text-[11px] uppercase tracking-[0.3em] text-stone-400 transition hover:text-stone-700">
            Comité de suivi
          </Link>
          <div className="flex items-baseline gap-4 text-xs text-stone-400">
            {membre && (
              <span className="truncate">
                {membre.nomSacre || `${membre.prenoms} ${membre.nom}`}
                {membre.isAdmin && <span className="ml-2 text-stone-300">admin</span>}
              </span>
            )}
            <button type="button" onClick={sortir} className="transition hover:text-stone-700">
              Sortir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-10">{children}</main>
    </div>
  )
}
