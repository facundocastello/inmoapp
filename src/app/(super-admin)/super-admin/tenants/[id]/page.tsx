import { notFound } from 'next/navigation'

import { TenantForm } from '@/components/tenant/TenantForm'
import { PageContainer } from '@/components/ui/layout/PageContainer'
import { getPlans } from '@/lib/actions/plans'
import { getTenant } from '@/lib/actions/tenant'

interface TenantPageProps {
  params: Promise<{ id: string }>
}

export default async function TenantPage({ params }: TenantPageProps) {
  const tenant = await getTenant((await params).id)
  const plans = await getPlans()

  if (!tenant) {
    notFound()
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Edit Tenant</h1>
        </div>

        <div className="rounded-lg border border-primary-200 p-6">
          <TenantForm
            plans={plans}
            initialData={{
              id: tenant.id,
              name: tenant.name,
              subdomain: tenant.subdomain,
              description: tenant.description,
              logo: tenant.logo,
              isActive: tenant.isActive,
              planId: tenant.planId,
              subscriptionType: tenant.subscriptionType,
            }}
          />
        </div>
      </div>
    </PageContainer>
  )
}
