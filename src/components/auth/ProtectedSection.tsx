import { redirect } from 'next/navigation'
import React from 'react'

import { auth } from '@/lib/auth'

export default async function ProtectedSection({
  children,
  shouldBeSuperAdmin,
  shouldBeAdmin,
}: {
  children: React.ReactNode
  shouldBeSuperAdmin?: boolean
  shouldBeAdmin?: boolean
}) {
  const session = await auth()
  if (
    !session ||
    (shouldBeSuperAdmin && session.user.role !== 'super-admin') ||
    (shouldBeAdmin && session.user.role !== 'ADMIN')
  )
    redirect('/login')

  return <>{children}</>
}
