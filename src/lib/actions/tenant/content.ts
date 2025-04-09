'use server'

import { getTenantClient } from '@/lib/get-tenant'
import { revalidateTenantTag } from '@/lib/utils/cache'

import { getCurrentUser } from '../auth'

export async function createContent({
  pageId,
  ...data
}: {
  title: string
  body: string
  pageId: string
}) {
  const tenantPrisma = await getTenantClient()
  const user = await getCurrentUser()

  if (!user) throw new Error('User not authenticated')

  const content = await tenantPrisma.content.create({
    data: {
      ...data,
      authorId: user.id,
      pageId,
    },
    include: { page: { select: { slug: true } } },
  })
  await revalidateTenantTag(`${content.page.slug}`)
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
  const content = await tenantPrisma.content.update({
    where: { id },
    data,
    include: { page: { select: { slug: true } } },
  })
  await revalidateTenantTag(`${content.page.slug}`)
  return content
}

export async function deleteContent(id: string) {
  const tenantPrisma = await getTenantClient()
  const content = await tenantPrisma.content.delete({
    where: { id },
    include: { page: { select: { slug: true } } },
  })
  await revalidateTenantTag(`${content.page.slug}`)
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
