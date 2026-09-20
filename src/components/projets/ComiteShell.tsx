'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, LogOut } from 'lucide-react'

export type ComiteMembre = {
  id: string
  nom: string
  prenoms: string
  nomSacre: string | null
  isAdmin: boolean
}

/**
 * Cadre de l'espace projets : une barre fixe comme dans une application,
 * le contenu défilant dessous, les zones tactiles à 44 px au minimum.
 */
export default function ComiteShell({
  membre,
  titre,
  retourHref,
  children,
}: {
  membre: ComiteMembre | null
  titre?: string
  retourHref?: string
  children: React.ReactNode
}) {
  const router = useRouter()

  const sortir = async () => {
    await fetch('/api/projets/logout', { method: 'POST' })
    window.location.assign('/projets')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50 text-gray-950">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-gray-900 focus:px-4 focus:py-3 focus:text-base focus:text-white"
      >
        Aller au contenu
      </a>

      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex min-h-14 max-w-3xl items-center gap-2 px-2 sm:px-4">
          {retourHref ? (
            <Link
              href={retourHref}
              className="-ml-1 flex h-11 min-w-11 items-center gap-1 rounded-lg px-2 text-base font-medium text-gray-700 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Projets</span>
              <span className="sr-only sm:hidden">Revenir aux projets</span>
            </Link>
          ) : (
            <Link
              href="/projets/suivi"
              className="flex h-11 items-center rounded-lg px-2 text-base font-semibold text-gray-950 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              Suivi des projets
            </Link>
          )}

          {titre && (
            <p className="min-w-0 flex-1 truncate px-1 text-center text-base font-semibold text-gray-950 sm:text-left">
              {titre}
            </p>
          )}
          {!titre && <span className="flex-1" />}

          {membre && (
            <p className="hidden max-w-[12rem] truncate text-sm text-gray-600 sm:block">
              {membre.nomSacre || `${membre.prenoms} ${membre.nom}`}
              {membre.isAdmin && <span className="ml-2 text-gray-400">admin</span>}
            </p>
          )}

          <button
            type="button"
            onClick={sortir}
            className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2 text-base text-gray-600 transition hover:bg-gray-100 hover:text-gray-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden />
            <span className="sr-only">Fermer la session</span>
          </button>
        </div>
      </header>

      <main
        id="contenu"
        className="mx-auto w-full max-w-3xl flex-1 px-4 pb-[calc(env(safe-area-inset-bottom)+3rem)] pt-6 sm:px-6"
      >
        {children}
      </main>
    </div>
  )
}
