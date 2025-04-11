'use client'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

import { initializeAETitle, pingDcm4chee } from '@/lib/actions/tenant/dcm4chee'

import { LoadingMessage } from '../ui/LoadingMessage'

export default function InitializeAETitle({
  subdomain,
}: {
  subdomain: string
}) {
  const router = useRouter()
  useEffect(() => {
    const interval = setInterval(() => {
      pingDcm4chee().then((isReady) => {
        console.log('ping', isReady)
        if (isReady) {
          initializeAETitle(subdomain).then(() => {
            clearInterval(interval)
            router.refresh()
          })
        }
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])
  return (
    <LoadingMessage
      messages={['Initializing server', 'Initializing AETitle']}
    />
  )
}
