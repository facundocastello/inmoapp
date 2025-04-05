import ProtectedSection from '@/components/auth/ProtectedSection'
import { TenantAdminLayout } from '@/components/ui/layout/TenantAdminLayout'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedSection shouldBeAdmin>
      <TenantAdminLayout>{children}</TenantAdminLayout>
    </ProtectedSection>
  )
}
