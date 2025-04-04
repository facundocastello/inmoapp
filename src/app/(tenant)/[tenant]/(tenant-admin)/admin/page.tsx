'use client'

import { signOut } from 'next-auth/react'
import React from 'react'

import { Button } from '@/components/ui/Button'

export default function page() {
  return (
    <div>
      <Button onClick={() => signOut()}>test</Button>
    </div>
  )
}
