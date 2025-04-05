import ProtectedSection from '@/components/auth/ProtectedSection'
import { AdminLayout } from '@/components/ui/layout/AdminLayout'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedSection shouldBeSuperAdmin>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedSection>
  )
}
