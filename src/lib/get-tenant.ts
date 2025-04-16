import { headers } from 'next/headers'

import { prisma } from './prisma'

export async function getTenantSubdomain(): Promise<string | null> {
  const headersList = await headers()
  const tenantSubdomain = headersList.get('x-tenant-id')

  return tenantSubdomain || null
}

export async function getTenantClient() {
  const tenantSubdomain = await getTenantSubdomain()
  if (!tenantSubdomain) throw new Error('Tenant ID not found')
  return {
    prisma,
    tenantSubdomain,
  }
}

export async function requireTenantSubdomain() {
  const tenantSubdomain = await getTenantSubdomain()
  if (!tenantSubdomain) throw new Error('Tenant ID not found')
  return { tenantSubdomain }
}
