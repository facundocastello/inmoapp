'use server'

import { requireTenantSubdomain } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
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
  const { tenantSubdomain } = await requireTenantSubdomain()
  const user = await getCurrentUser()

  if (!user) throw new Error('User not authenticated')

  const content = await prisma.content.create({
    data: {
      ...data,
      authorId: user.id,
      pageId,
      tenantSubdomain,
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
  const { tenantSubdomain } = await requireTenantSubdomain()
  const content = await prisma.content.update({
    where: { id, tenantSubdomain },
    data,
    include: { page: { select: { slug: true } } },
  })
  await revalidateTenantTag(`${content.page.slug}`)
  return content
}

export async function deleteContent(id: string) {
  const { tenantSubdomain } = await requireTenantSubdomain()
  const content = await prisma.content.delete({
    where: { id, tenantSubdomain },
    include: { page: { select: { slug: true } } },
  })
  await revalidateTenantTag(`${content.page.slug}`)
}

export async function getContent(id: string) {
  const { tenantSubdomain } = await requireTenantSubdomain()
  return prisma.content.findUnique({
    where: { id, tenantSubdomain },
    include: { page: true },
  })
}

export async function getContentByPage(pageId: string) {
  const { tenantSubdomain } = await requireTenantSubdomain()
  return prisma.content.findMany({
    where: { pageId, tenantSubdomain },
    include: { page: true },
  })
}
