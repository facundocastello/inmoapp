'use server'

import { requireTenantId } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { revalidateTenantRelationTag } from '@/lib/utils/cache'

import { getCurrentUser } from '../auth'

export async function createContent({
  pageId,
  ...data
}: {
  title: string
  body: string
  pageId: string
}) {
  const { tenantId } = await requireTenantId()
  const user = await getCurrentUser()

  if (!user) throw new Error('User not authenticated')

  const content = await prisma.content.create({
    data: {
      ...data,
      authorId: user.id,
      pageId,
      tenantId,
    },
    include: { page: { select: { slug: true } } },
  })
  const slug = content.page.slug
  await revalidateTenantRelationTag(`${slug}-page`, tenantId)
  return content
}

export async function updateContent(
  id: string,
  data: {
    title?: string
    body?: string
  },
) {
  const { tenantId } = await requireTenantId()
  const content = await prisma.content.update({
    where: { id, tenantId },
    data,
    include: { page: { select: { slug: true } } },
  })
  const slug = content.page.slug
  await revalidateTenantRelationTag(`${slug}-page`, tenantId)
  return content
}

export async function deleteContent(id: string) {
  const { tenantId } = await requireTenantId()
  const content = await prisma.content.delete({
    where: { id, tenantId },
    include: { page: { select: { slug: true } } },
  })
  const slug = content.page.slug
  await revalidateTenantRelationTag(`${slug}-page`, tenantId)
}

export async function getContent(id: string) {
  const { tenantId } = await requireTenantId()
  return prisma.content.findUnique({
    where: { id, tenantId },
    include: { page: true },
  })
}

export async function getContentByPage(pageId: string) {
  const { tenantId } = await requireTenantId()
  return prisma.content.findMany({
    where: { pageId, tenantId },
    include: { page: true },
  })
}
