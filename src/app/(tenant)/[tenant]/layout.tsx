import { notFound, redirect } from 'next/navigation'

import { prisma } from '@/lib/prisma'

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { tenant: string }
}) {
  const tenantParams = (await params).tenant
  const tenant = await prisma.tenant.findUnique({
    where: {
      subdomain: tenantParams,
      isActive: true,
    },
  })

  if (!tenant) return notFound()

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1 className={styles.headerTitleText}>{tenant.name}</h1>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}

const styles = {
  container: 'min-h-screen bg-background',
  header: 'border-b',
  headerTitle: 'text-2xl font-bold',
  headerTitleText: 'text-2xl font-bold',
}
