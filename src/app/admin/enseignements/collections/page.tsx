'use client'

import { useCallback } from 'react'
import OngletCollections from '@/components/enseignements/OngletCollections'
import { Annonce, useAnnonce } from '@/components/enseignements/Annonce'

export default function PageCollections() {
  const { message, signaler } = useAnnonce()
  const onMessage = useCallback(signaler, [signaler])

  return (
    <>
      <Annonce message={message} />
      <OngletCollections onMessage={onMessage} />
    </>
  )
}
