import { headers } from 'next/headers'

export async function getTenantId(): Promise<string | null> {
  const headersList = await headers()
  const tenantId = headersList.get('x-tenant-id')

  return tenantId || null
} 