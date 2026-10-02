'use client'

import { useCallback } from 'react'
import OngletRessources from '@/components/enseignements/OngletRessources'
import { Annonce, useAnnonce } from '@/components/enseignements/Annonce'

export default function PageRessources() {
  const { message, signaler } = useAnnonce()
  const onMessage = useCallback(signaler, [signaler])

  return (
    <>
      <Annonce message={message} />
      <OngletRessources onMessage={onMessage} />
    </>
  )
}
