import { getPrismaClient } from '@/lib/db/prisma'

export default async function TenantPage({
  params,
}: {
  params: { tenant: string }
}) {
  const prisma = getPrismaClient()
  const tenantParams = (await params).tenant
  const tenant = await prisma.tenant.findUnique({
    where: {
      subdomain: tenantParams,
      isActive: true,
    },
  })
  console.log({ tenant })

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold">Welcome to {tenant?.name}</h2>
      <p className="text-lg text-muted-foreground">
        This is your tenant-specific homepage.
      </p>
    </div>
  )
}
