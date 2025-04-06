'use server'

import { hash } from 'bcryptjs'
import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'

import { TenantFormData } from '@/components/tenant/TenantForm'
import { getTenantId } from '@/lib/get-tenant'
import { getTenantPrismaClient, prisma } from '@/lib/prisma'
import { darkColorsPreset } from '@/theme/colors'

import { createTenantDatabase, deleteTenantDatabase } from '../prisma/db'
import { uploadFile } from './file'
import { Tenant as PrismaTenant } from '.prisma/shared'

export async function getCurrentTenant() {
  // In a real application, you would get the tenant from the session or context
  const tenantSubdomain = await getTenantId()
  if (!tenantSubdomain) return null
  const tenant = await prisma.tenant.findUnique({
    where: {
      subdomain: tenantSubdomain,
    },
    include: {
      plan: true,
    },
  })

  return tenant
}

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
  planId: true,
  subscriptionType: true,
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
        select: { ...DEFAULT_SELECT, plan: true },
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
    // Create the tenant's database and push schema
    const dbResult = await createTenantDatabase(data.subdomain)
    if (!dbResult.success) {
      throw new Error('Failed to create tenant database')
    }

    const parsedLogo =
      data.logo instanceof File
        ? await uploadFile(data.logo, { shouldOptimize: true })
        : data.logo

    // Generate a one-time use token
    const oneUseToken = randomBytes(32).toString('hex')

    // Create tenant in shared database
    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        subdomain: data.subdomain,
        description: data.description,
        logo: parsedLogo,
        isActive: data.isActive,
        databaseName: data.subdomain,
        theme: data.theme || {},
        oneUseToken, // Store the token
      },
      select: DEFAULT_SELECT,
    })

    // If admin data is provided, create the admin user in the tenant's database
    if (data.admin) {
      const tenantPrisma = await getTenantPrismaClient(data.subdomain)
      const hashedPassword = await hash(data.admin.password, 10)

      await tenantPrisma.user.create({
        data: {
          name: data.admin.name,
          email: data.admin.email,
          password: hashedPassword,
          role: 'ADMIN',
        },
      })
    }

    revalidatePath('/super-admin/tenants')
    return {
      success: true,
      data: {
        ...tenant,
        createdAt: tenant.createdAt.toISOString(),
        oneUseToken, // Return the token
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
    const tenant = await prisma.tenant.findUnique({
      where: { id },
    })

    if (!tenant?.subdomain.includes('test')) {
      throw new Error('Can only delete test tenants')
    }

    // Delete all payments associated with the tenant first
    await prisma.payment.deleteMany({
      where: { tenantId: id },
    })

    // Delete the tenant's database
    const result = await deleteTenantDatabase(tenant.subdomain)
    if (!result.success) {
      throw new Error('Failed to delete tenant database')
    }

    // Now we can safely delete the tenant
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
