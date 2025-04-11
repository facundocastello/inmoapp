import { revalidateTag } from 'next/cache'

import { getTenantId } from '../get-tenant'

export async function revalidateTenantTag(tag: string) {
  return revalidateTag(await getTenantTag(tag))
}

export async function getTenantTag(tag: string) {
  const tenantId = await getTenantId()
  if (!tenantId) return tag
  return `${tenantId}-${tag}`
}
