'use client'

import { useState, useEffect } from 'react'
import { Play, Clock, ChevronLeft, MessageCircle, X, ChevronRight, Heart } from 'lucide-react'
import Link from 'next/link'
import { VideothequeCuratedSection } from '@/components/videotheque/VideothequeCuratedSection'
import { isFeaturedKabbal2026Title } from '@/lib/isFeaturedKabbal2026Title'
import DonModal from '@/components/DonModal'

interface Course {
    id: string
    title: string
    videoUrl: string
    shortDescription: string
    longDescription: string
    thumbnailUrl: string | null
    order: number
    published: boolean
}

export default function VideothequePage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
    const [showWhatsappModal, setShowWhatsappModal] = useState(false)
    const [activeTab, setActiveTab] = useState<'resume' | 'question' | 'communaute'>('resume')
    const [donModalOpen, setDonModalOpen] = useState(false)

    useEffect(() => {
        fetchCourses()

        // Check if user has seen WhatsApp modal
        const hasSeenModal = localStorage.getItem('whatsappModalSeen')
        if (!hasSeenModal && courses.length > 0) {
            setTimeout(() => setShowWhatsappModal(true), 3000)
        }
    }, [])

    const fetchCourses = async () => {
        try {
            const response = await fetch('/api/cours')
            if (response.ok) {
                const data = await response.json()
                setCourses(data)
            }
        } catch (err) {
            console.error('Erreur lors du chargement des cours:', err)
        } finally {
            setLoading(false)
        }
    }

    const getVideoEmbedUrl = (url: string) => {
        // YouTube
        const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
        if (youtubeMatch) {
            return `https://www.youtube.com/embed/${youtubeMatch[1]}`
        }

        // Google Drive (convertir lien de partage en lien d'embed)
        const driveMatch = url.match(/\/drive\.google\.com\/file\/d\/([^\/]+)\/view/)
        if (driveMatch) {
            return `https://drive.google.com/file/d/${driveMatch[1]}/preview`
        }

        return url
    }

    const handleJoinWhatsapp = () => {
        setShowWhatsappModal(false)
        localStorage.setItem('whatsappModalSeen', 'true')
        window.open('https://chat.whatsapp.com/your-group-link', '_blank')
    }

    const dismissWhatsappModal = () => {
        setShowWhatsappModal(false)
        localStorage.setItem('whatsappModalSeen', 'true')
    }

    const gridCourses = courses.filter((c) => !isFeaturedKabbal2026Title(c.title))
    const currentIndex = selectedCourse ? gridCourses.findIndex((c) => c.id === selectedCourse.id) : -1
    const prevCourse = currentIndex > 0 ? gridCourses[currentIndex - 1] : null
    const nextCourse = currentIndex >= 0 && currentIndex < gridCourses.length - 1 ? gridCourses[currentIndex + 1] : null

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        )
    }

    if (selectedCourse) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header minimaliste */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setSelectedCourse(null)}
                                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 mr-1" />
                                <span className="font-medium">Retour</span>
                            </button>
                            <div className="flex items-center space-x-2">
                                {prevCourse && (
                                    <button
                                        onClick={() => setSelectedCourse(prevCourse)}
                                        className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        <span className="hidden sm:inline">Précédent</span>
                                    </button>
                                )}
                                {nextCourse && (
                                    <button
                                        onClick={() => setSelectedCourse(nextCourse)}
                                        className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <span className="hidden sm:inline">Suivant</span>
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Contenu principal - Layout avec vidéo à gauche et tabs à droite */}
                <main className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Lecteur vidéo - 2/3 de la largeur */}
                        <div className="lg:col-span-2">
                            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg sticky top-20">
                                <iframe
                                    src={getVideoEmbedUrl(selectedCourse.videoUrl)}
                                    title={selectedCourse.title}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>

                        {/* Panel latéral avec tabs - 1/3 de la largeur */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-20">
                                {/* Tabs Navigation */}
                                <div className="flex border-b border-gray-200">
                                    <button
                                        onClick={() => setActiveTab('resume')}
                                        className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                                            activeTab === 'resume'
                                                ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        📖 Résumé
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('question')}
                                        className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                                            activeTab === 'question'
                                                ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        ❓ Question
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('communaute')}
                                        className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                                            activeTab === 'communaute'
                                                ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        👥 Communauté
                                    </button>
                                </div>

                                {/* Tab Content */}
                                <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                                    {activeTab === 'resume' && (
                                        <div className="space-y-4">
                                            <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                                                {selectedCourse.title}
                                            </h1>
                                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                                {selectedCourse.shortDescription}
                                            </p>
                                            {selectedCourse.longDescription && (
                                                <div className="prose prose-sm prose-gray max-w-none">
                                                    <h2 className="text-sm font-semibold text-gray-900 mb-2">
                                                        Description détaillée
                                                    </h2>
                                                    <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm">
                                                        {selectedCourse.longDescription}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'question' && (
                                        <div className="space-y-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xl">💬</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                                                        Une question sur cette vidéo ?
                                                    </h3>
                                                    <p className="text-gray-600 text-xs sm:text-sm mb-3">
                                                        Nos enseignants sont là pour vous aider.
                                                    </p>
                                                    <a
                                                        href="https://wa.me/22900000000"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-xs sm:text-sm w-full justify-center"
                                                    >
                                                        <MessageCircle className="w-4 h-4 mr-2" />
                                                        Poser ma question
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'communaute' && (
                                        <div className="space-y-4">
                                            <div className="text-center py-2">
                                                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <MessageCircle className="w-7 h-7 text-green-500" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    Rejoignez la communauté ETU
                                                </h3>
                                                <p className="text-gray-600 text-xs sm:text-sm mb-4">
                                                    Échangez avec les autres étudiants et restez informé.
                                                </p>
                                                <div className="space-y-2">
                                                    <button
                                                        onClick={handleJoinWhatsapp}
                                                        className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                                                    >
                                                        <MessageCircle className="w-4 h-4 mr-2" />
                                                        WhatsApp
                                                    </button>
                                                    <a
                                                        href="https://facebook.com/groups/etu"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                                                    >
                                                        Facebook
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center text-gray-700 hover:text-gray-900">
                                <ChevronLeft className="w-5 h-5 mr-2" />
                                <span className="font-serif">Retour</span>
                            </Link>
                        </div>
                        <div className="flex items-center">
                            <img
                                src="/logo-etu.png"
                                alt="Logo ETU"
                                className="h-10 w-10 mr-3"
                            />
                            <span className="text-xl font-serif font-bold text-gray-900">ETU Bénin</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Header */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mb-4">
                        Vidéothèque
                    </h1>
                    <p className="text-xl text-gray-600 font-serif">
                        Enseignements et conférences de l&apos;ETU en vidéo
                    </p>
                </div>
            </div>

            <VideothequeCuratedSection />

            {/* Video Grid - Style YouTube */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                {gridCourses.length === 0 ? (
                    <div className="text-center py-16">
                        <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Aucune vidéo disponible pour le moment</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gridCourses.map((course) => (
                            <div
                                key={course.id}
                                onClick={() => setSelectedCourse(course)}
                                className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                {/* Thumbnail */}
                                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                                    {course.thumbnailUrl ? (
                                        <img
                                            src={course.thumbnailUrl}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                                            <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                                            <Play className="w-8 h-8 text-gray-900 ml-1" />
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                        {course.shortDescription}
                                    </p>
                                    <div className="flex items-center text-gray-500 text-xs">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>Vidéo</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Appel au don */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
                <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-6 flex flex-col sm:flex-row items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white border border-rose-100 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-6 h-6 text-rose-400" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <p className="text-sm font-semibold text-gray-800 mb-1">Soutenir la diffusion des enseignements</p>
                        <p className="text-xs text-gray-600">Aidez l'ETU à produire et diffuser davantage d'enseignements vidéo dans le monde.</p>
                    </div>
                    <button
                        onClick={() => setDonModalOpen(true)}
                        className="flex-shrink-0 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Heart className="w-4 h-4 text-rose-300" />
                        Faire un don
                    </button>
                </div>
            </div>

            <DonModal open={donModalOpen} onClose={() => setDonModalOpen(false)} />

            {/* Modale WhatsApp */}
            {showWhatsappModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div
                            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                            onClick={dismissWhatsappModal}
                        />

                        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                            <div className="relative">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                                <MessageCircle className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">
                                                Restez informé !
                                            </h3>
                                        </div>
                                        <button
                                            onClick={dismissWhatsappModal}
                                            className="text-white hover:text-gray-200 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="px-6 py-8">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <MessageCircle className="w-8 h-8 text-green-500" />
                                        </div>
                                        <h4 className="text-xl font-semibold text-gray-900 mb-2">
                                            Rejoignez notre communauté
                                        </h4>
                                        <p className="text-gray-600">
                                            Soyez informé des nouvelles vidéos et des actualités de l&apos;ETU Bénin.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={handleJoinWhatsapp}
                                            className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                                        >
                                            <MessageCircle className="w-5 h-5 mr-2" />
                                            Rejoindre le groupe WhatsApp
                                        </button>
                                        <button
                                            onClick={dismissWhatsappModal}
                                            className="w-full px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                                        >
                                            Plus tard
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
