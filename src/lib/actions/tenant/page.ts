'use server'

import { revalidatePath, unstable_cache } from 'next/cache'

import { ContentFormData } from '@/components/admin/pages/ContentForm'
import { getTenantId, requireTenantId } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import {
  getTenantRelationTag,
  revalidateTenantRelationTag,
} from '@/lib/utils/cache'

export async function createPage(data: PageFormData) {
  const { tenantId } = await requireTenantId()

  // If this is set as homepage, unset any existing homepage
  if (data.isHome) {
    await prisma.page.updateMany({
      where: { isHome: true, tenantId },
      data: { isHome: false },
    })
  }

  const page = await prisma.page.create({
    data: { ...data, tenantId },
  })
  revalidatePath('/[tenant]')
  return page
}

export async function updatePage(id: string, data: PageFormData) {
  const { tenantId } = await requireTenantId()

  // If this is set as homepage, unset any existing homepage
  if (data.isHome) {
    await prisma.page.updateMany({
      where: { isHome: true, id: { not: id }, tenantId },
      data: { isHome: false },
    })
  }

  const page = await prisma.page.update({
    where: { id, tenantId },
    data: { ...data, tenantId },
  })
  revalidatePath('/[tenant]')
  return page
}

export async function updatePageContent(id: string, data: ContentFormData) {
  const { tenantId } = await requireTenantId()
  const page = await prisma.page.findUnique({
    where: { id, tenantId },
    select: { authorId: true },
  })
  if (!page) throw new Error('Page not found')

  const updateContent = data.contents.filter(({ id }) => id) as {
    id: string
    title: string
    body: string
  }[]
  const createContent = data.contents.filter(({ id }) => !id) as {
    title: string
    body: string
  }[]
  const updatedPage = await prisma.page.update({
    where: { id, tenantId },
    data: {
      content: {
        updateMany: updateContent.map((content) => ({
          where: { id: content.id },
          data: { title: content.title, body: content.body },
        })),
        create: createContent.map((content) => ({
          ...content,
          author: { connect: { id: page.authorId } },
          tenant: { connect: { id: tenantId } },
        })),
      },
    },
    include: { content: true },
  })
  await revalidateTenantRelationTag(`${updatedPage.slug}-page`)
  return updatedPage
}

export async function deletePage(id: string) {
  const { tenantId } = await requireTenantId()
  await prisma.page.delete({
    where: { id, tenantId },
  })
  revalidatePath('/[tenant]')
}

export async function getPage(id: string) {
  const { tenantId } = await requireTenantId()
  return prisma.page.findUnique({
    where: { id, tenantId },
    include: {
      content: true,
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })
}

export async function getPages() {
  const { tenantId } = await requireTenantId()
  return prisma.page.findMany({
    where: { tenantId },
    include: {
      content: true,
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })
}

export async function getFeaturedPages() {
  const { tenantId } = await requireTenantId()
  return prisma.page.findMany({
    where: { isFeatured: true, tenantId },
    include: { content: true },
  })
}

export async function getPageBySlug(slug: string, tenantId: string) {
  return prisma.page.findUnique({
    where: { slug_tenantId: { slug, tenantId } },
    include: { content: true },
  })
}

export const cachedGetPageBySlug = async (slug: string) => {
  const tenantId = await getTenantId()
  if (!tenantId) throw new Error('Tenant ID not found')
  return unstable_cache(getPageBySlug, ['page', slug], {
    tags: [await getTenantRelationTag(`${slug}-page`)],
  })(slug, tenantId)
}

export async function getHomepage() {
  const { tenantId } = await requireTenantId()
  return prisma.page.findFirst({
    where: { isHome: true, tenantId },
    include: { content: true },
  })
}

export async function getAllPages() {
  const { tenantId } = await requireTenantId()
  return prisma.page.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    include: { content: true },
  })
}
export interface PageFormData {
  title: string
  slug: string
  isActive: boolean
  isFeatured: boolean
  isHome: boolean
  authorId: string
}
