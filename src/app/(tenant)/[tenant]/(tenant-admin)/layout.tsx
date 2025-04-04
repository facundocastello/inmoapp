import ProtectedSection from '@/components/auth/ProtectedSection'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedSection shouldBeAdmin>{children}</ProtectedSection>
}
