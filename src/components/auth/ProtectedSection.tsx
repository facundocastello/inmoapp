import { redirect } from 'next/navigation'
import React from 'react'

import { auth } from '@/lib/auth'

export default async function ProtectedSection({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) redirect('/login')

  return <>{children}</>
}
