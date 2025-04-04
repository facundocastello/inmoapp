import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/auth/LoginForm'
import { getIsAdmin } from '@/lib/auth'

export default async function page() {
  const isAdmin = await getIsAdmin()
  if (isAdmin) redirect('/admin')

  return <LoginForm />
}
