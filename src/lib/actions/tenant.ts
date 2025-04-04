'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getTenantId } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { darkColorsPreset } from '@/theme/colors'

import { Tenant as PrismaTenant } from '.prisma/shared'

export async function getTenantColorSchema(): Promise<PrismaTenant['theme']> {
  const tenantId = await getTenantId()
  if (!tenantId) return darkColorsPreset
  return darkColorsPreset
}

export type TenantFormData = {
  name: string
  subdomain: string
  description?: string | null
  logo?: string | null
  isActive: boolean
  theme?: {
    primaryColor?: string
    secondaryColor?: string
  } | null
}

const tenantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subdomain: z.string().min(1, 'Subdomain is required'),
  description: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  theme: z
    .object({
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
    })
    .optional()
    .nullable(),
})

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
        theme: tenant.theme as TenantFormData['theme'],
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
      theme: tenant.theme as TenantFormData['theme'],
      createdAt: tenant.createdAt.toISOString(),
    }
  } catch (error) {
    console.error('Error fetching tenant:', error)
    throw new Error('Failed to fetch tenant')
  }
}

export async function createTenant(data: TenantFormData) {
  try {
    const validated = tenantSchema.parse(data)

    const tenant = await prisma.tenant.create({
      data: {
        name: validated.name,
        subdomain: validated.subdomain,
        description: validated.description,
        logo: validated.logo,
        isActive: validated.isActive,
        databaseName: validated.subdomain,
        theme: validated.theme || {},
      },
      select: DEFAULT_SELECT,
    })

    revalidatePath('/super-admin/tenants')
    return {
      success: true,
      data: {
        ...tenant,
        theme: tenant.theme as TenantFormData['theme'],
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
    const validated = tenantSchema.parse(data)

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        name: validated.name,
        subdomain: validated.subdomain,
        description: validated.description,
        logo: validated.logo,
        isActive: validated.isActive,
        databaseName: validated.subdomain,
        theme: validated.theme || {},
      },
      select: DEFAULT_SELECT,
    })

    revalidatePath('/super-admin/tenants')
    revalidatePath(`/super-admin/tenants/${id}`)
    return {
      success: true,
      data: {
        ...tenant,
        theme: tenant.theme as TenantFormData['theme'],
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
