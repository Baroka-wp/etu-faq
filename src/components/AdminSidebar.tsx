'use client'

import { useState } from 'react'
import {
    Users,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    UserPlus,
    FileText,
    Shield,
    BookOpen,
    Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface AdminSidebarProps {
    activeTab: string
    onTabChange: (tab: string) => void
    onLogout: () => void
}

export default function AdminSidebar({ activeTab, onTabChange, onLogout }: AdminSidebarProps) {
    const [isOpen, setIsOpen] = useState(false)

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Tableau de bord',
            icon: BarChart3,
            href: '/admin/dashboard'
        },
        {
            id: 'inscriptions',
            label: 'Inscriptions',
            icon: Users,
            href: '/admin/inscriptions'
        },
        {
            id: 'bibliotheque',
            label: 'Bibliothèque',
            icon: BookOpen,
            href: '/admin/bibliotheque'
        },
        {
            id: 'carte-du-ciel',
            label: 'Carte du ciel',
            icon: Sparkles,
            href: '/admin/carte-du-ciel'
        },
        {
            id: 'members',
            label: 'Membres',
            icon: UserPlus,
            href: '/admin/members'
        },
        {
            id: 'grades',
            label: 'Grades & Programmes',
            icon: Shield,
            href: '/admin/grades'
        },
        {
            id: 'reports',
            label: 'Rapports',
            icon: FileText,
            href: '/admin/reports'
        },
        {
            id: 'settings',
            label: 'Paramètres',
            icon: Settings,
            href: '/admin/settings'
        }
    ]

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
                <div className="flex flex-col h-full overflow-y-auto">
                    {/* Logo */}
                    <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <img
                                src="https://z-cdn-media.chatglm.cn/files/68e00202-7aa7-4b85-a148-a40fdb4ac3f7_logo.png?auth_key=1791497410-4f07e789ecd94c959d996139b8c142b3-0-310a7d57abdef550ba4f1b3ace27306a"
                                alt="Logo ETU"
                                className="w-8 h-8"
                            />
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">ETU Admin</h1>
                                <p className="text-xs text-gray-500">Dashboard</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            const isActive = activeTab === item.id

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={() => {
                                        onTabChange(item.id)
                                        setIsOpen(false)
                                    }}
                                    className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                    ${isActive
                                            ? 'bg-gray-100 text-gray-900 border-r-2 border-gray-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }
                  `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="px-4 py-4 border-t border-gray-200">
                        <button
                            onClick={onLogout}
                            className="flex items-center space-x-3 w-full px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Déconnexion</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
