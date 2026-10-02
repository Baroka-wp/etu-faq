'use client'

import { useState } from 'react'

export type Message = { type: 'success' | 'error'; texte: string }

/** Bandeau de retour commun aux pages de la section. */
export function useAnnonce() {
  const [message, setMessage] = useState<Message | null>(null)
  return { message, signaler: setMessage }
}

export function Annonce({ message }: { message: Message | null }) {
  if (!message) return null
  return (
    <p
      role="status"
      className={`rounded-xl border px-4 py-3 text-sm ${
        message.type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      {message.texte}
    </p>
  )
}
