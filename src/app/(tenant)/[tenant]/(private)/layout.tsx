import ProtectedSection from '@/components/auth/ProtectedSection'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedSection>{children}</ProtectedSection>
}
