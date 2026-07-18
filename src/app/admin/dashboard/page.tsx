'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, BookOpen, CalendarDays, Loader2, MapPin, UserPlus, Users } from 'lucide-react'
import AdminSidebar from '@/components/AdminSidebar'
import { formatAppDate, formatAppTime } from '@/lib/datetime'

interface DashboardStats {
  activeMembers: number
  monthEvents: number
  pendingAspirants: number
  books: number
  upcomingEvents: Array<{
    id: string
    titre: string
    date: string
    lieu: string
    inscriptions: number
  }>
}

const modules = [
  {
    href: '/admin/programmes',
    title: 'Planifications',
    description: 'Programmes mensuels, liens publics et inscriptions aux événements.',
    icon: CalendarDays,
    stat: 'monthEvents' as const,
    statLabel: 'événement(s) ce mois',
  },
  {
    href: '/admin/members',
    title: 'Membres OMP',
    description: 'Fiches des membres, grades, accès et rôles administrateurs.',
    icon: Users,
    stat: 'activeMembers' as const,
    statLabel: 'membres actifs',
  },
  {
    href: '/admin/inscriptions',
    title: 'Aspirants explorateurs',
    description: 'Demandes d’adhésion et suivi des nouveaux aspirants.',
    icon: UserPlus,
    stat: 'pendingAspirants' as const,
    statLabel: 'en attente',
  },
  {
    href: '/admin/bibliotheque',
    title: 'Bibliothèque',
    description: 'Livres et ressources documentaires proposées aux membres.',
    icon: BookOpen,
    stat: 'books' as const,
    statLabel: 'ouvrages',
  },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/admin/dashboard')
        if (response.status === 401) {
          router.push('/admin-login')
          return
        }
        const body = await response.json()
        if (!response.ok) throw new Error(body.error)
        setStats(body)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Chargement impossible')
      }
    }
    void load()
  }, [router])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin-login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar activeTab="dashboard" onTabChange={() => undefined} onLogout={logout} />
      <main className="min-h-screen lg:ml-64">
        <header className="border-b border-gray-200 bg-white px-4 py-7 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Administration OMP</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Membres et planifications</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Un accès direct aux opérations essentielles de l’Ordre des Marins Pêcheurs.
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          {!stats ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-gray-400" aria-label="Chargement" />
            </div>
          ) : (
            <>
              <section className="grid gap-4 sm:grid-cols-2" aria-label="Modules administratifs">
                {modules.map((module, index) => {
                  const Icon = module.icon
                  return (
                    <Link key={module.href} href={module.href} className={`group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md ${index === 0 ? 'sm:col-span-2 sm:p-7' : ''}`}>
                      <div className="flex items-start justify-between gap-5">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white">
                          <Icon className="h-5 w-5" />
                        </span>
                        <ArrowRight className="h-5 w-5 text-gray-300 transition group-hover:translate-x-1 group-hover:text-gray-700" />
                      </div>
                      <h2 className="mt-5 text-xl font-semibold text-gray-950">{module.title}</h2>
                      <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">{module.description}</p>
                      <p className="mt-5 text-sm text-gray-500">
                        <span className="mr-2 text-2xl font-bold text-gray-950">{stats[module.stat]}</span>
                        {module.statLabel}
                      </p>
                    </Link>
                  )
                })}
              </section>

              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
                  <div>
                    <h2 className="font-semibold text-gray-950">Prochains événements</h2>
                    <p className="mt-0.5 text-xs text-gray-500">Planning OMP à venir</p>
                  </div>
                  <Link href="/admin/programmes" className="text-sm font-medium text-gray-600 hover:text-gray-950">Gérer le planning</Link>
                </div>
                {stats.upcomingEvents.length === 0 ? (
                  <p className="px-6 py-10 text-center text-sm text-gray-500">Aucun événement planifié.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {stats.upcomingEvents.map((event) => (
                      <Link key={event.id} href="/admin/programmes" className="flex flex-col gap-3 px-5 py-4 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{event.titre}</p>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span>{formatAppDate(event.date, { day: 'numeric', month: 'long', year: 'numeric' })} · {formatAppTime(event.date)}</span>
                            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.lieu}</span>
                          </div>
                        </div>
                        <span className="shrink-0 text-sm text-gray-500">{event.inscriptions} inscrit{event.inscriptions > 1 ? 's' : ''}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
