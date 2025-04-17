import { revalidateTag } from 'next/cache'

import { getTenantId } from '../get-tenant'

export async function revalidateTenantRelationTag(
  tag: string,
  tenantId?: string,
) {
  return revalidateTag(await getTenantRelationTag(tag, tenantId))
}

export async function getTenantRelationTag(tag: string, id?: string) {
  const tenantId = id || (await getTenantId())
  if (!tenantId) return tag
  return `${tenantId}-${tag}`
}
