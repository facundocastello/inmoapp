'use client'

import { signOut } from 'next-auth/react'
import React from 'react'

import { Button } from '@/components/ui/Button'

export default function page() {
  return (
    <div className={styles.container}>
      <Button onClick={() => signOut()}>Logout</Button>
    </div>
  )
}

const styles = {
  container: '',
}
