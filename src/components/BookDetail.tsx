'use client'

import { useState } from 'react'
import { BookOpen, MessageCircle, ArrowLeft, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Book {
    id: string
    title: string
    slug: string
    author: string
    description: string
    price?: number
    isFree: boolean
    category: 'etu' | 'recommended'
    imageUrl: string
    whatsappMessage: string
}

interface BookDetailProps {
    book: Book
}

export default function BookDetail({ book }: BookDetailProps) {
    const [copied, setCopied] = useState(false)

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
                            src="/logo.svg"
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

                        {/* Category Info */}
                        <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-2">
                                {book.category === 'etu' ? '📚 Édition ETU' : '📖 Lecture recommandée'}
                            </h4>
                            <p className="text-sm text-gray-600">
                                {book.category === 'etu'
                                    ? 'Livre officiel de l\'ETU-Bénin. Commande via WhatsApp avec paiement à la livraison.'
                                    : 'Ouvrage de référence recommandé. Contactez-nous pour plus d\'informations.'}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            {/* WhatsApp Button */}
                            <button
                                onClick={handleWhatsAppContact}
                                className="w-full bg-gray-900 text-white py-3.5 px-6 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center text-base font-medium"
                            >
                                <MessageCircle className="w-5 h-5 mr-2" />
                                {book.isFree ? 'Demander des informations' : 'Commander via WhatsApp'}
                            </button>

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
        </div>
    )
}
