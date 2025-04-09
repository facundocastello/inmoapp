'use server'

import { revalidatePath, unstable_cache } from 'next/cache'

import { ContentFormData } from '@/components/admin/pages/ContentForm'
import { getTenantClient, getTenantId } from '@/lib/get-tenant'
import { getTenantPrismaClient } from '@/lib/prisma'
import { getTenantTag, revalidateTenantTag } from '@/lib/utils/cache'

export async function createPage(data: PageFormData) {
  const tenantPrisma = await getTenantClient()

  // If this is set as homepage, unset any existing homepage
  if (data.isHome) {
    await tenantPrisma.page.updateMany({
      where: { isHome: true },
      data: { isHome: false },
    })
  }

  const page = await tenantPrisma.page.create({
    data,
  })
  revalidatePath('/[tenant]')
  return page
}

export async function updatePage(id: string, data: PageFormData) {
  const tenantPrisma = await getTenantClient()

  // If this is set as homepage, unset any existing homepage
  if (data.isHome) {
    await tenantPrisma.page.updateMany({
      where: { isHome: true, id: { not: id } },
      data: { isHome: false },
    })
  }

  const page = await tenantPrisma.page.update({
    where: { id },
    data,
  })
  revalidatePath('/[tenant]')
  return page
}

export async function updatePageContent(id: string, data: ContentFormData) {
  const tenantPrisma = await getTenantClient()
  const page = await tenantPrisma.page.findUnique({
    where: { id },
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
  const updatedPage = await tenantPrisma.page.update({
    where: { id },
    data: {
      content: {
        updateMany: updateContent.map((content) => ({
          where: { id: content.id },
          data: { title: content.title, body: content.body },
        })),
        create: createContent.map((content) => ({
          ...content,
          author: { connect: { id: page.authorId } },
        })),
      },
    },
    include: { content: true },
  })
  await revalidateTenantTag(`${updatedPage.slug}`)
  return updatedPage
}

export async function deletePage(id: string) {
  const tenantPrisma = await getTenantClient()
  await tenantPrisma.page.delete({
    where: { id },
  })
  revalidatePath('/[tenant]')
}

export async function getPage(id: string) {
  const tenantPrisma = await getTenantClient()
  return tenantPrisma.page.findUnique({
    where: { id },
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
  const tenantPrisma = await getTenantClient()
  return tenantPrisma.page.findMany({
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
  const tenantPrisma = await getTenantClient()
  return tenantPrisma.page.findMany({
    where: { isFeatured: true },
    include: { content: true },
  })
}

export async function getPageBySlug(slug: string, tenantId: string) {
  const tenantPrisma = await getTenantPrismaClient(tenantId)
  return tenantPrisma.page.findUnique({
    where: { slug },
    include: { content: true },
  })
}

export const cachedGetPageBySlug = async (slug: string) => {
  const tenantId = await getTenantId()
  if (!tenantId) throw new Error('Tenant ID not found')
  return unstable_cache(getPageBySlug, ['page', slug], {
    tags: [await getTenantTag(slug)],
  })(slug, tenantId)
}

export async function getHomepage() {
  const tenantPrisma = await getTenantClient()
  return tenantPrisma.page.findFirst({
    where: { isHome: true },
    include: { content: true },
  })
}

export async function getAllPages() {
  const tenantPrisma = await getTenantClient()
  return tenantPrisma.page.findMany({
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
