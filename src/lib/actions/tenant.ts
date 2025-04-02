'use server'

import { getTenantId } from '@/lib/get-tenant'
import { darkColorsPreset } from '@/theme/colors'

import { Tenant } from '.prisma/shared'

export async function getTenantColorSchema(): Promise<Tenant['theme']> {
  const tenantId = await getTenantId()
  if (!tenantId) return darkColorsPreset
  return darkColorsPreset
}

// Example of how to create a new action that needs the tenant subdomain
export async function createTenantResource(_: any) {
  const tenantId = await getTenantId()
  if (!tenantId) return { success: false }
  return { success: true }
}
