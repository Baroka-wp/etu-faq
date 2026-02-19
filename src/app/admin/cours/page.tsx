'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Video, X, Save, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

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

export default function AdminCoursPage() {
    const [activeTab, setActiveTab] = useState('cours')
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState<Course | null>(null)
    const router = useRouter()

    const [formData, setFormData] = useState({
        title: '',
        videoUrl: '',
        shortDescription: '',
        longDescription: '',
        thumbnailUrl: '',
        order: 0,
        published: true
    })

    useEffect(() => {
        fetchCourses()
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

    const openModal = (course?: Course) => {
        if (course) {
            setEditingCourse(course)
            setFormData({
                title: course.title,
                videoUrl: course.videoUrl,
                shortDescription: course.shortDescription,
                longDescription: course.longDescription,
                thumbnailUrl: course.thumbnailUrl || '',
                order: course.order,
                published: course.published
            })
        } else {
            setEditingCourse(null)
            setFormData({
                title: '',
                videoUrl: '',
                shortDescription: '',
                longDescription: '',
                thumbnailUrl: '',
                order: courses.length,
                published: true
            })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingCourse(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingCourse
                ? `/api/cours/${editingCourse.id}`
                : '/api/cours'
            const method = editingCourse ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                fetchCourses()
                closeModal()
            }
        } catch (err) {
            console.error('Erreur lors de l\'enregistrement du cours:', err)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return

        try {
            const response = await fetch(`/api/cours/${id}`, { method: 'DELETE' })
            if (response.ok) {
                fetchCourses()
            }
        } catch (err) {
            console.error('Erreur lors de la suppression du cours:', err)
        }
    }

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/login')
        } catch (err) {
            console.error('Erreur lors de la déconnexion:', err)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            <AdminSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={handleLogout}
            />

            <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
                <div className="sticky top-0 z-30 bg-white border-b border-gray-200 flex-shrink-0">
                    <div className="px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Cours enregistrés</h1>
                                <p className="text-sm text-gray-600 mt-1">Gérez les vidéos de cours</p>
                            </div>
                            <button
                                onClick={() => openModal()}
                                className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter un cours
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {courses.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun cours</h3>
                            <p className="text-gray-500 mb-6">Commencez par ajouter votre premier cours</p>
                            <button
                                onClick={() => openModal()}
                                className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter un cours
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cours
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ordre
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Statut
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {courses.map((course) => (
                                            <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                                            {course.thumbnailUrl ? (
                                                                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover rounded" />
                                                            ) : (
                                                                <Video className="w-6 h-6 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                                            <a
                                                                href={course.videoUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-gray-500 hover:text-gray-700"
                                                            >
                                                                {course.videoUrl}
                                                            </a>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-xs truncate">{course.shortDescription}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-900">{course.order}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        course.published
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {course.published ? 'Publié' : 'Brouillon'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={() => openModal(course)}
                                                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(course.id)}
                                                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={closeModal} />

                        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {editingCourse ? 'Modifier le cours' : 'Ajouter un cours'}
                                </h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Titre *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        URL de la vidéo (YouTube ou Google Drive) *
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        value={formData.videoUrl}
                                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                        placeholder="https://www.youtube.com/watch?v=... ou https://drive.google.com/file/d/.../view"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Formats acceptés : YouTube (https://youtube.com/watch?v=...) ou Google Drive (https://drive.google.com/file/d/.../view)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        URL de la miniature (optionnel)
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.thumbnailUrl}
                                        onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Courte description *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.shortDescription}
                                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description longue (résumé) *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.longDescription}
                                        onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                                        rows={6}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ordre d'affichage
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="published"
                                        checked={formData.published}
                                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                                    />
                                    <label htmlFor="published" className="ml-2 text-sm text-gray-700">
                                        Publié
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {editingCourse ? 'Mettre à jour' : 'Ajouter'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
