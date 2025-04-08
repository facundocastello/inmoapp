import ProtectedSection from '@/components/auth/ProtectedSection'
import { TenantAdminLayout } from '@/components/ui/layout/TenantAdminLayout'
import { getCurrentTenantOrRedirect } from '@/lib/actions/tenant'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await getCurrentTenantOrRedirect()

  return (
    <ProtectedSection shouldBeAdmin>
      <TenantAdminLayout>{children}</TenantAdminLayout>
    </ProtectedSection>
  )
}
