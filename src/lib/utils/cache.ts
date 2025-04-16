import { revalidateTag } from 'next/cache'

import { getTenantSubdomain } from '../get-tenant'

export async function revalidateTenantTag(tag: string) {
  return revalidateTag(await getTenantTag(tag))
}

export async function getTenantTag(tag: string) {
  const tenantSubdomain = await getTenantSubdomain()
  if (!tenantSubdomain) return tag
  return `${tenantSubdomain}-${tag}`
}
