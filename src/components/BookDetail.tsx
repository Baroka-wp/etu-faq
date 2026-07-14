'use client'

import { useState } from 'react'
import { BookOpen, MessageCircle, ArrowLeft, Copy, Check, Facebook, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Book {
    id: string
    title: string
    slug: string
    author: string
    description: string
    price: number | null
    isFree: boolean
    category: string
    imageUrl: string
    whatsappMessage: string
    driveUrl: string
}

interface BookDetailProps {
    book: Book
}

export default function BookDetail({ book }: BookDetailProps) {
    const [copied, setCopied] = useState(false)
    const [showModal, setShowModal] = useState(false)

    // Convertir le lien Google Drive en lien de téléchargement direct
    const getDirectDownloadUrl = (url: string) => {
        // Lien de type: https://drive.google.com/file/d/FILE_ID/view
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
        if (match && match[1]) {
            return `https://drive.google.com/uc?export=download&id=${match[1]}`
        }
        // Lien de type: https://drive.google.com/open?id=FILE_ID
        const openMatch = url.match(/open\?id=([a-zA-Z0-9_-]+)/)
        if (openMatch && openMatch[1]) {
            return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`
        }
        return url
    }

    const handleDownload = () => {
        if (book.driveUrl) {
            const downloadUrl = getDirectDownloadUrl(book.driveUrl)
            // Lancer le téléchargement
            window.open(downloadUrl, '_blank')
            // Afficher la modale après un court délai
            setTimeout(() => setShowModal(true), 500)
        }
    }

    const handleWhatsAppContact = () => {
        const message = encodeURIComponent(book.whatsappMessage)
        const whatsappUrl = `https://wa.me/22967153974?text=${message}`
        window.open(whatsappUrl, '_blank')
    }

    const handleCopyLink = async () => {
        const url = window.location.href
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Erreur lors de la copie:', error)
        }
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-gray-900 text-white py-6 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center">
                        <Image
                            src="/logo-etu.png"
                            alt="ETU-Bénin Logo"
                            width={32}
                            height={32}
                            className="mr-3"
                        />
                        <h1 className="text-2xl font-bold">Bibliothèque ETU-Bénin</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation */}
                <div className="mb-8">
                    <Link
                        href="/bibliotheque"
                        className="text-gray-600 hover:text-gray-900 flex items-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour à la bibliothèque
                    </Link>
                </div>

                {/* Book Detail */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Column - Image */}
                    <div className="flex flex-col">
                        <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200 aspect-[3/4] flex items-center justify-center">
                            {book.imageUrl ? (
                                <img
                                    src={book.imageUrl}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <BookOpen className="w-32 h-32 text-gray-300" />
                            )}
                        </div>

                        {/* Share Button - Desktop */}
                        <button
                            onClick={handleCopyLink}
                            className="mt-4 hidden lg:flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span className="text-green-600 font-medium">Lien copié !</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    <span>Copier le lien</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right Column - Details */}
                    <div className="flex flex-col">
                        {/* Badge */}
                        <div className="mb-4">
                            <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${book.isFree
                                ? 'bg-gray-100 text-gray-700 border border-gray-300'
                                : 'bg-gray-900 text-white'
                                }`}>
                                {book.isFree ? 'Gratuit' : 'Payant'}
                            </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">{book.title}</h2>

                        {/* Author */}
                        <p className="text-lg text-gray-600 mb-6">par {book.author}</p>

                        {/* Price */}
                        {book.price && (
                            <div className="mb-6">
                                <p className="text-3xl font-bold text-gray-900">
                                    {book.price.toLocaleString()} FCFA
                                </p>
                            </div>
                        )}

                        {/* Description */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{book.description}</p>
                        </div>

                        {/* Download Link for Free Books */}
                        {book.isFree && book.driveUrl && (
                            <div className="mb-8">
                                <button
                                    onClick={handleDownload}
                                    className="w-full bg-gray-900 text-white py-3.5 px-6 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center text-base font-medium"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Télécharger le livre
                                </button>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            {/* WhatsApp Button - Only for paid books */}
                            {!book.isFree && (
                                <button
                                    onClick={handleWhatsAppContact}
                                    className="w-full bg-gray-900 text-white py-3.5 px-6 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center text-base font-medium"
                                >
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    Commander via WhatsApp
                                </button>
                            )}

                            {/* Share Button - Mobile */}
                            <button
                                onClick={handleCopyLink}
                                className="w-full lg:hidden py-3 px-6 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 mr-2 text-green-600" />
                                        <span className="text-green-600 font-medium">Lien copié !</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-2" />
                                        <span>Copier le lien</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal - Après téléchargement */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Téléchargement lancé ! 📥</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <p className="text-gray-600 mb-6">
                                Profitez de votre lecture ! Pour ne rien manquer de nos actualités, suivez-nous sur nos réseaux :
                            </p>

                            {/* ETU Formation */}
                            <a
                                href="https://www.etu-benin.org/faq"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 w-full p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors mb-3"
                            >
                                <svg className="w-6 h-6 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <div>
                                    <p className="font-semibold text-gray-900">En savoir plus sur nos formations</p>
                                    <p className="text-sm text-gray-600">Découvrez tous nos programmes</p>
                                </div>
                            </a>

                            {/* Facebook */}
                            <a
                                href="https://www.facebook.com/profile.php?id=61570538836966"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 w-full p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors mb-3"
                            >
                                <Facebook className="w-6 h-6 text-blue-600 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-blue-900">Suivez-nous sur Facebook</p>
                                    <p className="text-sm text-blue-700">Restez informé de nos actualités</p>
                                </div>
                            </a>

                            {/* WhatsApp Channel */}
                            <a
                                href="https://chat.whatsapp.com/Eg3vMRFbHP8KQiBXGluCqk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 w-full p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                            >
                                <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                <div>
                                    <p className="font-semibold text-green-900">Rejoignez notre canal WhatsApp privé</p>
                                    <p className="text-sm text-green-700">Contenu exclusif et annonces</p>
                                </div>
                            </a>

                            {/* Close Button */}
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full mt-6 py-3 px-4 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
