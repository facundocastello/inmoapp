'use server'

import { darkColorsPreset } from '@/theme/colors'
import { getTenantId } from '@/lib/get-tenant'

export async function getTenantColorSchema() {
  const tenantId = await getTenantId()
  if(!tenantId) return darkColorsPreset
  return darkColorsPreset
}

// Example of how to create a new action that needs the tenant subdomain
export async function createTenantResource(data: any) {
  const tenantId = await getTenantId()
  return { success: true }
}
