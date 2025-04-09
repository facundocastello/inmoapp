import PublicLayout from '@/components/ui/layout/PublicLayout'

export default async function layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}) {
  const { tenant } = await params

  return <PublicLayout tenant={tenant}>{children}</PublicLayout>
}
