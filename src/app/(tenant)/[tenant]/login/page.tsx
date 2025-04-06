import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/auth/LoginForm'
import { getIsAdmin } from '@/lib/auth'

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ oneUseToken: string }>
}) {
  const { oneUseToken } = await searchParams
  const isAdmin = await getIsAdmin()
  if (isAdmin) redirect('/admin')

  return <LoginForm oneUseToken={oneUseToken} />
}
