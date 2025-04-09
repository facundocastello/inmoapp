'use server'

import { revalidatePath } from 'next/cache'

import { getTenantClient } from '@/lib/get-tenant'

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

export async function getPageBySlug(slug: string) {
  const tenantPrisma = await getTenantClient()
  return tenantPrisma.page.findUnique({
    where: { slug },
    include: { content: true },
  })
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
