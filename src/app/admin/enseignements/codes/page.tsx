'use client'

import { useCallback } from 'react'
import OngletCodes from '@/components/enseignements/OngletCodes'
import { Annonce, useAnnonce } from '@/components/enseignements/Annonce'

export default function PageCodes() {
  const { message, signaler } = useAnnonce()
  const onMessage = useCallback(signaler, [signaler])

  return (
    <>
      <Annonce message={message} />
      <OngletCodes onMessage={onMessage} />
    </>
  )
}
