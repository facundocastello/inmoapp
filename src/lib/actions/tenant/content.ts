'use server'

import { getTenantClient } from '@/lib/get-tenant'

export async function createContent(data: {
  title: string
  body: string
  authorId: string
  pageId: string
}) {
  const tenantPrisma = await getTenantClient()
  // const tenantSubdomain = await getTenantId()
  const content = await tenantPrisma.content.create({
    data,
  })
  // revalidatePath('/[tenant]')
  return content
}

export async function updateContent(
  id: string,
  data: {
    title?: string
    body?: string
  },
) {
  const tenantPrisma = await getTenantClient()
  // const tenantSubdomain = await getTenantId()
  const content = await tenantPrisma.content.update({
    where: { id },
    data,
  })
  // revalidatePath('/[tenant]')
  return content
}

export async function deleteContent(id: string) {
  const tenantPrisma = await getTenantClient()
  // const tenantSubdomain = await getTenantId()
  await tenantPrisma.content.delete({
    where: { id },
  })
  // revalidatePath(`/${tenantSubdomain}`)
}

export async function getContent(id: string) {
  const tenantPrisma = await getTenantClient()
  return tenantPrisma.content.findUnique({
    where: { id },
    include: { page: true },
  })
}

export async function getContentByPage(pageId: string) {
  const tenantPrisma = await getTenantClient()
  return tenantPrisma.content.findMany({
    where: { pageId },
    include: { page: true },
  })
}
