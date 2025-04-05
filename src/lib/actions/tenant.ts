'use server'

import { revalidatePath } from 'next/cache'

import { TenantFormData } from '@/components/tenant/TenantForm'
import { getTenantId } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { darkColorsPreset } from '@/theme/colors'

import { uploadFile } from './file'
import { Tenant as PrismaTenant } from '.prisma/shared'

export async function getTenantColorSchema(): Promise<PrismaTenant['theme']> {
  const tenantId = await getTenantId()
  if (!tenantId) return darkColorsPreset
  return darkColorsPreset
}

const DEFAULT_SELECT = {
  id: true,
  name: true,
  subdomain: true,
  description: true,
  logo: true,
  isActive: true,
  theme: true,
  createdAt: true,
}

export async function getTenants({
  page = 1,
  limit = 10,
}: {
  page?: number
  limit?: number
}) {
  try {
    const skip = (page - 1) * limit
    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: DEFAULT_SELECT,
      }),
      prisma.tenant.count(),
    ])

    return {
      data: tenants.map((tenant) => ({
        ...tenant,
        createdAt: tenant.createdAt.toISOString(),
      })),
      total,
      totalPages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error('Error fetching tenants:', error)
    throw new Error('Failed to fetch tenants')
  }
}

export async function getTenant(id: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      select: DEFAULT_SELECT,
    })

    if (!tenant) {
      throw new Error('Tenant not found')
    }

    return {
      ...tenant,
      createdAt: tenant.createdAt.toISOString(),
    }
  } catch (error) {
    console.error('Error fetching tenant:', error)
    throw new Error('Failed to fetch tenant')
  }
}

export async function createTenant(data: TenantFormData) {
  try {
    const parsedLogo =
      data.logo instanceof File
        ? await uploadFile(data.logo, { shouldOptimize: true })
        : data.logo

    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        subdomain: data.subdomain,
        description: data.description,
        logo: parsedLogo,
        isActive: data.isActive,
        databaseName: data.subdomain,
        theme: data.theme || {},
      },
      select: DEFAULT_SELECT,
    })

    revalidatePath('/super-admin/tenants')
    return {
      success: true,
      data: {
        ...tenant,
        createdAt: tenant.createdAt.toISOString(),
      },
    }
  } catch (error) {
    console.error('Error creating tenant:', error)
    return { success: false, error: 'Failed to create tenant' }
  }
}

export async function updateTenant(id: string, data: TenantFormData) {
  try {
    const parsedLogo =
      data.logo instanceof File
        ? await uploadFile(data.logo, { shouldOptimize: true })
        : data.logo

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        name: data.name,
        subdomain: data.subdomain,
        description: data.description,
        logo: parsedLogo,
        isActive: data.isActive,
        databaseName: data.subdomain,
        theme: data.theme || {},
      },
      select: DEFAULT_SELECT,
    })

    revalidatePath('/super-admin/tenants')
    revalidatePath(`/super-admin/tenants/${id}`)
    return {
      success: true,
      data: {
        ...tenant,
        createdAt: tenant.createdAt.toISOString(),
      },
    }
  } catch (error) {
    console.error('Error updating tenant:', error)
    return { success: false, error: 'Failed to update tenant' }
  }
}

export async function deleteTenant(id: string) {
  try {
    await prisma.tenant.delete({
      where: { id },
    })

    revalidatePath('/super-admin/tenants')
    return { success: true }
  } catch (error) {
    console.error('Error deleting tenant:', error)
    return { success: false, error: 'Failed to delete tenant' }
  }
}

export type Tenants = Awaited<ReturnType<typeof getTenants>>
export type Tenant = Awaited<ReturnType<typeof getTenant>>
export type TenantTheme = Awaited<ReturnType<typeof getTenantColorSchema>>
