'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import MembreSidebar from '@/components/MembreSidebar'
import UpdateInfoBanner from '@/components/UpdateInfoBanner'

interface Membre {
  id: string
  nom: string
  prenoms: string
  nomSacre: string | null
  grade: string
  equipage: string
  imageUrl: string | null
  email: string
  telephoneWhatsapp: string
}

export default function MembreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [membre, setMembre] = useState<Membre | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Ne pas appliquer le layout sur la page de login
  const isLoginPage = pathname === '/membre/login'

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false)
      return
    }

    const fetchMembre = async () => {
      try {
        const response = await fetch('/api/membre/me')

        if (!response.ok) {
          router.push('/membre/login')
          return
        }

        const data = await response.json()
        setMembre(data.membre)
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)
        router.push('/membre/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembre()
  }, [router, isLoginPage, pathname])

  // Page de login - pas de layout
  if (isLoginPage) {
    return <>{children}</>
  }

  // Chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-serif">Chargement...</p>
        </div>
      </div>
    )
  }

  // Pas de membre connecté
  if (!membre) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MembreSidebar membre={membre} />
      <div className="lg:ml-72 min-h-screen flex flex-col">
        <UpdateInfoBanner membre={membre} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
