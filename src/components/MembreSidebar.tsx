'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Calendar, Star, BookOpen, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface MembreSidebarProps {
  membre: {
    nom: string
    prenoms: string
    nomSacre: string | null
    grade: string
    equipage: string
    imageUrl: string | null
  }
}

const gradeColors: Record<string, string> = {
  'Explorateur': 'bg-green-100 text-green-800',
  'Constructeur': 'bg-blue-100 text-blue-800',
  'Navigateur': 'bg-purple-100 text-purple-800',
  'Alchimiste': 'bg-yellow-100 text-yellow-800'
}

export default function MembreSidebar({ membre }: MembreSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/membre/logout', { method: 'POST' })
      router.push('/membre/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  const menuItems = [
    { href: '/membre/dashboard', icon: Home, label: 'Tableau de bord' },
    { href: '/membre/planning', icon: Calendar, label: 'Planning' },
    { href: '/membre/carte-du-ciel', icon: Star, label: 'Carte du ciel' },
    { href: '/membre/bibliotheque', icon: BookOpen, label: 'Bibliothèque' },
    { href: '/membre/profil', icon: User, label: 'Mon profil' },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-40
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header avec logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="https://z-cdn-media.chatglm.cn/files/68e00202-7aa7-4b85-a148-a40fdb4ac3f7_logo.png?auth_key=1791497410-4f07e789ecd94c959d996139b8c142b3-0-310a7d57abdef550ba4f1b3ace27306a"
                alt="Logo ETU"
                className="w-12 h-12"
              />
              <div>
                <h1 className="text-lg font-serif font-bold text-gray-900">OMP-ETU</h1>
                <p className="text-xs font-serif text-gray-600">Bénin</p>
              </div>
            </div>

            {/* Profil membre */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-3 mb-2">
                {membre.imageUrl ? (
                  <img
                    src={membre.imageUrl}
                    alt={membre.nomSacre || ''}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate font-serif">
                    {membre.nomSacre || `${membre.prenoms} ${membre.nom}`}
                  </p>
                  <p className="text-xs text-gray-600 font-serif">
                    {membre.equipage}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${gradeColors[membre.grade] || 'bg-gray-100 text-gray-800'}`}>
                  {membre.grade}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-serif
                    ${isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Déconnexion */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-serif"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Déconnexion</span>
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center font-serif">
              ETU - Depuis 1977
            </p>
            <p className="text-xs text-gray-400 text-center font-serif mt-1">
              © 2024 Tous droits réservés
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
