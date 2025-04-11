'use client'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

import { pingDcm4chee } from '@/lib/actions/tenant/dcm4chee'

import { LoadingMessage } from '../ui/LoadingMessage'

export default function StartingDcm4chee() {
  const router = useRouter()
  useEffect(() => {
    const interval = setInterval(async () => {
      const isReady = await pingDcm4chee()
      if (isReady) {
        clearInterval(interval)
        router.refresh()
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [])
  return (
    <LoadingMessage
      infinite={false}
      messages={[
        'Initializing server',
        'Initializing AETitle',
        'Initializing DICOM',
        'Configuring DICOM services',
        'Setting up storage configuration',
        'Establishing network connections',
        'Verifying system requirements',
        'Preparing DICOM archive',
        'Loading DICOM services',
        'Finalizing setup',
      ]}
      time={10000}
      customMessage="Dcm4chee is being initialized, this could take a few minutes. If it
        takes more than 5 minutes, please contact support."
    />
  )
}
