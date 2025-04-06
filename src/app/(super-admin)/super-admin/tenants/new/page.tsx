import { TenantForm } from '@/components/tenant/TenantForm'
import { PageContainer } from '@/components/ui/layout/PageContainer'
import { prisma } from '@/lib/prisma'

export default async function NewTenantPage() {
  const plans = await prisma.plan.findMany()
  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Create Tenant</h1>
        </div>

        <div className="rounded-lg border border-primary-200 bg-primary-900 p-6">
          <TenantForm plans={plans} />
        </div>
      </div>
    </PageContainer>
  )
}
