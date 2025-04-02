import { notFound, redirect } from 'next/navigation'

import { prisma } from '@/lib/prisma'

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { tenant: string }
}) {
  try {
    const tenantParams = (await params).tenant
    const tenant = await prisma.tenant.findUnique({
      where: {
        subdomain: tenantParams,
        isActive: true,
      },
    })

    if (!tenant) {
      console.log(`[TenantLayout] Tenant not found or inactive: ${params.tenant}`)
      redirect('/')
    }

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">{tenant.name}</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">{children}</main> 
      </div>
    )
  } catch (error) {
    console.error(
      `[TenantLayout] Error loading tenant: ${params.tenant}`,
      error,
    )
    return notFound()
  }
}
