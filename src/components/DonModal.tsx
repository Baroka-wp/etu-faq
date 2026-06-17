'use client'

import { X, Heart, MessageCircle } from 'lucide-react'

interface DonModalProps {
  open: boolean
  onClose: () => void
}

const WHATSAPP_NUMBER = '22967153974'
const MESSAGE = "Bonjour, je souhaite faire un don pour soutenir les activités de l'École Transcendantaliste Universelle (ETU Bénin). Pouvez-vous m'indiquer la marche à suivre ?"

export default function DonModal({ open, onClose }: DonModalProps) {
  if (!open) return null

  const handleDon = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGE)}`, '_blank')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
              <Heart className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-gray-900">Faire un don</h2>
              <p className="text-xs font-serif text-gray-400">ETU Bénin — OMP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors ml-4 flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Modalités */}
        <div className="px-6 pt-5 pb-4">
          <p className="text-xs font-serif font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Modalités d'envoi des fonds
          </p>
          <div className="space-y-3">
            <div className="rounded-xl bg-stone-50 border border-stone-200 px-4 py-3">
              <p className="text-xs font-serif font-semibold text-gray-800 mb-0.5">Mobile Money (MoMo) — Bénin</p>
              <p className="text-sm font-serif font-bold text-gray-900 tracking-wide">+229 01 67 15 39 74</p>
            </div>
            <div className="rounded-xl bg-stone-50 border border-stone-200 px-4 py-3">
              <p className="text-xs font-serif font-semibold text-gray-800 mb-0.5">Depuis l'étranger</p>
              <p className="text-xs font-serif text-gray-600">MoneyGram, Western Union ou virement bancaire — nous contacter pour les détails.</p>
            </div>
          </div>
          <p className="text-xs font-serif text-gray-400 mt-3 italic">
            Un reçu de confirmation vous sera envoyé après réception.
          </p>
        </div>

        {/* Bouton */}
        <div className="px-6 pb-6">
          <button
            onClick={handleDon}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3 px-6 rounded-xl transition-all font-serif font-semibold text-sm shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="w-4 h-4" />
            Contacter via WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}
