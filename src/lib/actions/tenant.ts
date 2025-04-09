'use server'

import { hash } from 'bcryptjs'
import { randomBytes } from 'crypto'
import { revalidatePath, unstable_cache } from 'next/cache'
import { redirect } from 'next/navigation'

import { getTenantId } from '@/lib/get-tenant'
import { getTenantPrismaClient, prisma } from '@/lib/prisma'
import { darkColorsPreset } from '@/theme/colors'

import { deleteTenantDatabase, pushTenantDatabase } from '../prisma/db'
import { uploadFile } from './file'
import {
  PaymentMethod,
  SubscriptionStatus,
  Tenant as PrismaTenant,
} from '.prisma/shared'

export type TenantFormData = {
  name: string
  subdomain: string
  description?: string | null
  logo?: File | string | null | undefined
  isActive: boolean
  theme?: TenantTheme
  planId: string
  subscriptionType: 'MANUAL' | 'AUTOMATED'
  admin?: {
    name: string
    email: string
    password: string
  }
}

export async function getCurrentTenantOrRedirect() {
  try {
    const tenantSubdomain = await getTenantId()
    if (!tenantSubdomain) return null
    const tenant = await cachedGetTenant(tenantSubdomain)
    return tenant
  } catch (error) {
    redirect(`${process.env.BASE_URL}`)
  }
}

export async function getTenantColorSchema(): Promise<PrismaTenant['theme']> {
  const tenantId = await getTenantId()
  if (!tenantId) return darkColorsPreset
  return darkColorsPreset
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
        select: { ...DEFAULT_SELECT },
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

export async function updateTenantDatabase(subdomain: string) {
  const dbResult = await pushTenantDatabase(subdomain)
  if (!dbResult.success) {
    throw new Error('Failed to create tenant database')
  }
}

export async function createTenant(data: TenantFormData) {
  try {
    // Create the tenant's database and push schema
    const dbResult = await pushTenantDatabase(data.subdomain)
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
        subscription: {
          create: {
            status: SubscriptionStatus.ACTIVE,
            paymentMethod: PaymentMethod.MANUAL,
            nextPaymentAt: new Date(),
            billingCycle: 1,
            gracePeriodDays: 15,
            graceStartedAt: new Date(),
            plan: {
              connect: {
                id: data.planId,
              },
            },
          },
        },
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

    // Delete all related records in the shared database
    const sub = await prisma.subscription.findUnique({
      where: { tenantId: id },
    })
    await prisma.$transaction([
      // Delete all payments associated with the tenant
      prisma.payment.deleteMany({
        where: { subscriptionId: sub?.id },
      }),
      prisma.subscription.deleteMany({
        where: { tenantId: id },
      }),
      // Delete theme settings if exists
      prisma.themeSettings.deleteMany({
        where: { tenantId: id },
      }),
    ])

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

const getTenantBySubdomain = async (subdomain: string) => {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
  })
  return tenant
}

const cachedGetTenant = (tenantId: string) =>
  unstable_cache(getTenantBySubdomain, ['tenant', tenantId], {
    tags: [`tenant-${tenantId}`],
  })(tenantId)

export type Tenants = Awaited<ReturnType<typeof getTenants>>
export type Tenant = Awaited<ReturnType<typeof getTenant>>
export type TenantTheme = Awaited<ReturnType<typeof getTenantColorSchema>>

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
