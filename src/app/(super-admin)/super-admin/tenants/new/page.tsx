import { TenantForm } from '@/components/tenant/TenantForm'
import { PageContainer } from '@/components/ui/layout/PageContainer'

export default function NewTenantPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Create Tenant</h1>
        </div>

        <div className="rounded-lg border border-primary-200 bg-primary-900 p-6">
          <TenantForm />
        </div>
      </div>
    </PageContainer>
  )
}
