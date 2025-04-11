'use client'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

import { initializeDropletIp } from '@/lib/actions/droplet'

import { LoadingMessage } from '../ui/LoadingMessage'
import { Droplet } from '.prisma/shared'

export default function InitializeDroplet({ droplet }: { droplet: Droplet }) {
  const router = useRouter()
  useEffect(() => {
    initializeDropletIp(droplet.id, droplet.dropletId).then((res) => {
      console.log(res)
      router.refresh()
    })
  }, [])
  return (
    <LoadingMessage
      messages={[
        'Initializing Droplet',
        'Assigning IP',
        'Initializing Firewall',
        'Assigning Resources',
      ]}
    />
  )
}
