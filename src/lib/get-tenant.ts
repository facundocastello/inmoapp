import { headers } from 'next/headers'

import { getTenantPrismaClient } from './prisma'

export async function getTenantId(): Promise<string | null> {
  const headersList = await headers()
  const tenantId = headersList.get('x-tenant-id')

  return tenantId || null
}

export async function getTenantClient() {
  const tenantId = await getTenantId()
  if (!tenantId) throw new Error('Tenant ID not found')
  return getTenantPrismaClient(tenantId)
}
