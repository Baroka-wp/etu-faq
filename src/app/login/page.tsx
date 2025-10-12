'use client'

import { useState } from 'react'
import { ArrowLeft, User, Shield } from 'lucide-react'
import Link from 'next/link'
import ClientOnly from '@/components/ClientOnly'

export default function LoginPage() {

    return (
        <ClientOnly fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        }>
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <Link href="/" className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-serif">Retour à la FAQ</span>
                    </Link>

                    <div className="flex justify-center mb-6">
                        <img
                            src="https://z-cdn-media.chatglm.cn/files/68e00202-7aa7-4b85-a148-a40fdb4ac3f7_logo.png?auth_key=1791497410-4f07e789ecd94c959d996139b8c142b3-0-310a7d57abdef550ba4f1b3ace27306a"
                            alt="Logo ETU"
                            className="w-16 h-16"
                        />
                    </div>

                    <h2 className="text-center text-3xl font-bold text-gray-900">
                        Choisir votre type de connexion
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 font-serif">
                        École Transcendantaliste Universelle
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="space-y-4">
                            {/* Connexion Membre */}
                            <Link
                                href="/member-login"
                                className="w-full flex items-center justify-between p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <User className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Connexion Membre</h3>
                                        <p className="text-sm text-gray-600">Accéder à votre profil personnel</p>
                                    </div>
                                </div>
                                <div className="text-gray-400 group-hover:text-gray-600">
                                    →
                                </div>
                            </Link>

                            {/* Connexion Admin */}
                            <Link
                                href="/admin-login"
                                className="w-full flex items-center justify-between p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Connexion Admin</h3>
                                        <p className="text-sm text-gray-600">Gérer les inscriptions et membres</p>
                                    </div>
                                </div>
                                <div className="text-gray-400 group-hover:text-gray-600">
                                    →
                                </div>
                            </Link>
                        </div>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500 font-serif">
                                        Choisissez votre type d'accès
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ClientOnly>
    )
}
