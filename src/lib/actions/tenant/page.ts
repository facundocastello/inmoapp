'use server'

import { revalidatePath, unstable_cache } from 'next/cache'

import { ContentFormData } from '@/components/admin/pages/ContentForm'
import { getTenantSubdomain, requireTenantSubdomain } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { getTenantTag, revalidateTenantTag } from '@/lib/utils/cache'

export async function createPage(data: PageFormData) {
  const { tenantSubdomain } = await requireTenantSubdomain()

  // If this is set as homepage, unset any existing homepage
  if (data.isHome) {
    await prisma.page.updateMany({
      where: { isHome: true, tenantSubdomain },
      data: { isHome: false },
    })
  }

  const page = await prisma.page.create({
    data: { ...data, tenantSubdomain },
  })
  revalidatePath('/[tenant]')
  return page
}

export async function updatePage(id: string, data: PageFormData) {
  const { tenantSubdomain } = await requireTenantSubdomain()

  // If this is set as homepage, unset any existing homepage
  if (data.isHome) {
    await prisma.page.updateMany({
      where: { isHome: true, id: { not: id }, tenantSubdomain },
      data: { isHome: false },
    })
  }

  const page = await prisma.page.update({
    where: { id, tenantSubdomain },
    data: { ...data, tenantSubdomain },
  })
  revalidatePath('/[tenant]')
  return page
}

export async function updatePageContent(id: string, data: ContentFormData) {
  const { tenantSubdomain } = await requireTenantSubdomain()
  const page = await prisma.page.findUnique({
    where: { id, tenantSubdomain },
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
    where: { id, tenantSubdomain },
    data: {
      content: {
        updateMany: updateContent.map((content) => ({
          where: { id: content.id },
          data: { title: content.title, body: content.body },
        })),
        create: createContent.map((content) => ({
          ...content,
          author: { connect: { id: page.authorId } },
          tenant: { connect: { id: tenantSubdomain } },
        })),
      },
    },
    include: { content: true },
  })
  await revalidateTenantTag(`${updatedPage.slug}`)
  return updatedPage
}

export async function deletePage(id: string) {
  const { tenantSubdomain } = await requireTenantSubdomain()
  await prisma.page.delete({
    where: { id, tenantSubdomain },
  })
  revalidatePath('/[tenant]')
}

export async function getPage(id: string) {
  const { tenantSubdomain } = await requireTenantSubdomain()
  return prisma.page.findUnique({
    where: { id, tenantSubdomain },
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
  const { tenantSubdomain } = await requireTenantSubdomain()
  return prisma.page.findMany({
    where: { tenantSubdomain },
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
  const { tenantSubdomain } = await requireTenantSubdomain()
  return prisma.page.findMany({
    where: { isFeatured: true, tenantSubdomain },
    include: { content: true },
  })
}

export async function getPageBySlug(slug: string, tenantSubdomain: string) {
  return prisma.page.findUnique({
    where: { slug_tenantSubdomain: { slug, tenantSubdomain } },
    include: { content: true },
  })
}

export const cachedGetPageBySlug = async (slug: string) => {
  const tenantSubdomain = await getTenantSubdomain()
  if (!tenantSubdomain) throw new Error('Tenant ID not found')
  return unstable_cache(getPageBySlug, ['page', slug], {
    tags: [await getTenantTag(slug)],
  })(slug, tenantSubdomain)
}

export async function getHomepage() {
  const { tenantSubdomain } = await requireTenantSubdomain()
  return prisma.page.findFirst({
    where: { isHome: true, tenantSubdomain },
    include: { content: true },
  })
}

export async function getAllPages() {
  const { tenantSubdomain } = await requireTenantSubdomain()
  return prisma.page.findMany({
    where: { tenantSubdomain },
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
