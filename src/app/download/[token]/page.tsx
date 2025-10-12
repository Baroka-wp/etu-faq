'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Download, Clock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface LinkData {
    id: string
    token: string
    pdfPath: string
    isActive: boolean
    expiresAt: string
    downloadedAt: string | null
    inscription: {
        nom: string
        prenom: string
        grade: string
    }
}

export default function DownloadPage() {
    const params = useParams()
    const token = params.token as string
    const [linkData, setLinkData] = useState<LinkData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        fetchLinkData()
    }, [token])

    const fetchLinkData = async () => {
        try {
            const response = await fetch(`/api/download/${token}`)
            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Lien non trouvé')
                return
            }

            setLinkData(data)
        } catch (err) {
            setError('Erreur lors du chargement du lien')
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        if (!linkData) return

        setDownloading(true)
        try {
            const response = await fetch(`/api/download/${token}/file`)

            if (!response.ok) {
                throw new Error('Erreur lors du téléchargement')
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = linkData.pdfPath
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            // Marquer comme téléchargé
            await fetch(`/api/download/${token}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ downloaded: true })
            })

            setLinkData(prev => prev ? { ...prev, downloadedAt: new Date().toISOString() } : null)
        } catch (err) {
            setError('Erreur lors du téléchargement')
        } finally {
            setDownloading(false)
        }
    }

    const isExpired = linkData ? new Date(linkData.expiresAt) < new Date() : false
    const isDownloaded = linkData?.downloadedAt !== null

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        )
    }

    if (error || !linkData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <Image
                            src="/logo.svg"
                            alt="ETU-Bénin Logo"
                            width={32}
                            height={32}
                            className="mr-2"
                        />
                        <span className="text-lg font-semibold text-gray-800">ETU-Bénin</span>
                    </div>
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Lien non valide</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                    >
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gray-800 text-white p-6 text-center">
                    <div className="flex items-center justify-center mb-3">
                        <Image
                            src="/logo.svg"
                            alt="ETU-Bénin Logo"
                            width={40}
                            height={40}
                            className="mr-3"
                        />
                        <h1 className="text-2xl font-bold font-serif">ETU-Bénin</h1>
                    </div>
                    <p className="text-gray-300">Téléchargement du cours</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Student Info */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Bonjour {linkData.inscription.prenom} {linkData.inscription.nom}
                        </h2>
                        <p className="text-gray-600">
                            Grade: <span className="font-semibold">{linkData.inscription.grade}</span>
                        </p>
                    </div>

                    {/* Status */}
                    <div className="mb-6">
                        {isExpired ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <Clock className="w-5 h-5 text-red-500 mr-2" />
                                    <span className="text-red-700 font-medium">Lien expiré</span>
                                </div>
                                <p className="text-red-600 text-sm mt-1">
                                    Ce lien a expiré. Contactez l'administrateur pour un nouveau lien.
                                </p>
                            </div>
                        ) : isDownloaded ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                    <span className="text-green-700 font-medium">Déjà téléchargé</span>
                                </div>
                                <p className="text-green-600 text-sm mt-1">
                                    Vous avez déjà téléchargé ce cours.
                                </p>
                            </div>
                        ) : !linkData.isActive ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                                    <span className="text-yellow-700 font-medium">Lien désactivé</span>
                                </div>
                                <p className="text-yellow-600 text-sm mt-1">
                                    Ce lien a été désactivé par l'administrateur.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <Download className="w-5 h-5 text-blue-500 mr-2" />
                                    <span className="text-blue-700 font-medium">Prêt au téléchargement</span>
                                </div>
                                <p className="text-blue-600 text-sm mt-1">
                                    Cliquez sur le bouton ci-dessous pour télécharger votre cours.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Download Button */}
                    {linkData.isActive && !isExpired && !isDownloaded && (
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {downloading ? (
                                <>
                                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                    Téléchargement...
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5 mr-2" />
                                    Télécharger le cours
                                </>
                            )}
                        </button>
                    )}

                    {/* Expiration Info */}
                    {!isExpired && (
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-500">
                                Expire le {new Date(linkData.expiresAt).toLocaleDateString('fr-FR')} à {new Date(linkData.expiresAt).toLocaleTimeString('fr-FR')}
                            </p>
                        </div>
                    )}

                    {/* Back to Home */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="text-gray-600 hover:text-gray-900 text-sm"
                        >
                            ← Retour à l'accueil
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
