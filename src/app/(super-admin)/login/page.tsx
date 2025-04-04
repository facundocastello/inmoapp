import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/auth/LoginForm'
import { getIsSuperAdmin } from '@/lib/auth'

export default async function page() {
  const isSuperAdmin = await getIsSuperAdmin()
  if (isSuperAdmin) redirect('/super-admin')

  return <LoginForm />
}
