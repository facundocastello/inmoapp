'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

import { cachedGetTenantId } from './actions/tenant'
import { prisma } from './prisma'

export async function getTenantId(): Promise<string | null> {
  const headersList = await headers()
  const tenantSubdomain = headersList.get('x-tenant-subdomain')
  if (!tenantSubdomain) return null
  const tenantId = await cachedGetTenantId(tenantSubdomain)
  return tenantId || null
}

export async function revalidateTenantSubdomainPath(path: string) {
  const headersList = await headers()
  const tenantSubdomain = headersList.get('x-tenant-subdomain')
  if (!tenantSubdomain) return null
  console.log(`/${tenantSubdomain}${path}`)
  return revalidatePath(`/${tenantSubdomain}${path}`)
}

export async function getTenantClient() {
  const tenantId = await getTenantId()
  if (!tenantId) throw new Error('Tenant ID not found')
  return {
    prisma,
    tenantId,
  }
}

export async function requireTenantId() {
  const tenantId = await getTenantId()
  if (!tenantId) throw new Error('Tenant ID not found')
  return { tenantId }
}
