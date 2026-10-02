'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Compass, KeyRound, Layers, Library, NotebookPen } from 'lucide-react'
import AdminSidebar from '@/components/AdminSidebar'

const SECTIONS = [
  { href: '/admin/enseignements', label: 'Vue d’ensemble', icone: Compass },
  { href: '/admin/enseignements/ressources', label: 'Ressources', icone: Library },
  { href: '/admin/enseignements/collections', label: 'Collections', icone: Layers },
  { href: '/admin/enseignements/codes', label: 'Codes d’accès', icone: KeyRound },
  { href: '/admin/enseignements/themes', label: 'Thèmes enseignés', icone: NotebookPen },
] as const

export default function EnseignementsLayout({ children }: { children: React.ReactNode }) {
  const chemin = usePathname()
  const router = useRouter()

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin-login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar activeTab="enseignements" onTabChange={() => undefined} onLogout={logout} />
      <main className="min-h-screen lg:ml-64">
        <header className="border-b border-gray-200 bg-white px-4 pt-7 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl pl-12 lg:pl-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Transmission</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Enseignements</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Ce que l’on transmet : les documents mis à disposition, à qui ils sont ouverts, et le relevé
              de ce qui a été donné en séance.
            </p>

            <nav className="-mb-px mt-6 flex gap-1 overflow-x-auto" aria-label="Sections des enseignements">
              {SECTIONS.map(({ href, label, icone: Icone }) => {
                const actif = href === '/admin/enseignements' ? chemin === href : chemin.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={actif ? 'page' : undefined}
                    className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm transition ${
                      actif
                        ? 'border-gray-900 font-medium text-gray-950'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900'
                    }`}
                  >
                    <Icone className="h-4 w-4" aria-hidden />
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </header>

        <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
