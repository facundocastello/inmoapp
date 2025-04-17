'use server'

import { hash } from 'bcryptjs'
import { randomBytes } from 'crypto'
import { revalidatePath, unstable_cache } from 'next/cache'
import { redirect } from 'next/navigation'

import { prisma } from '@/lib/prisma'
import { darkColorsPreset } from '@/theme/colors'

import { getTenantId } from '../get-tenant'
import {
  getTenantRelationTag,
  revalidateTenantRelationTag,
} from '../utils/cache'
import { uploadFile } from './file'
import {
  PaymentMethod,
  PaymentStatus,
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
    const tenantId = await getTenantId()
    if (!tenantId) return null
    const tenant = await cachedGetTenant(tenantId)
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

export async function createTenant(data: TenantFormData) {
  try {
    const parsedLogo =
      data.logo instanceof File
        ? await uploadFile(data.logo, { shouldOptimize: true })
        : data.logo

    // Generate a one-time use token
    const oneUseToken = randomBytes(32).toString('hex')

    // Create tenant and related records in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant in shared database
      const plan = await tx.plan.findUnique({
        where: { id: data.planId },
      })
      if (!plan) {
        throw new Error('Plan not found')
      }
      const nextPaymentAt = new Date()
      const tenant = await tx.tenant.create({
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
              nextPaymentAt,
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
        select: {
          ...DEFAULT_SELECT,
          subscription: { select: { id: true } },
        },
      })

      // If admin data is provided, create the admin user in the tenant's database
      if (data.admin) {
        const hashedPassword = await hash(data.admin.password, 10)
        await tx.user.create({
          data: {
            name: data.admin.name,
            email: data.admin.email,
            password: hashedPassword,
            role: 'ADMIN',
            tenantId: tenant.id,
          },
        })
      }
      if (tenant.subscription)
        await tx.payment.create({
          data: {
            amount: plan.price,
            status: PaymentStatus.PENDING,
            paymentMethod: PaymentMethod.MANUAL,
            dueDate: nextPaymentAt,
            subscriptionId: tenant.subscription.id,
          },
        })

      return tenant
    })

    revalidateTenantRelationTag('tenant', result.id)
    revalidatePath('/super-admin/tenants')
    return {
      success: true,
      data: {
        ...result,
        createdAt: result.createdAt.toISOString(),
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

    revalidateTenantRelationTag('tenant', tenant.id)
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

export async function deleteTenant(id: string, force = false) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
    })
    if (!tenant) {
      throw new Error('Tenant not found')
    }
    if (!force && !tenant?.subdomain.includes('test')) {
      throw new Error('Can only delete test tenants')
    }
    // Delete all related records in the shared database
    const sub = await prisma.subscription.findUnique({
      where: { tenantId: id },
    })

    await prisma.content.deleteMany({
      where: { tenantId: id },
    })
    await prisma.page.deleteMany({
      where: { tenantId: id },
    })
    await prisma.$transaction([
      prisma.payment.deleteMany({
        where: { subscriptionId: sub?.id },
      }),
      prisma.subscription.deleteMany({
        where: { tenantId: id },
      }),
      prisma.themeSettings.deleteMany({
        where: { tenantId: id },
      }),
      prisma.user.deleteMany({
        where: { tenantId: id },
      }),
    ])

    // Now we can safely delete the tenant
    await prisma.tenant.delete({
      where: { id },
    })

    revalidatePath('/super-admin/tenants')
    revalidateTenantRelationTag('tenant', tenant.id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting tenant:', (error as Error).message)
    return {
      success: false,
      error: 'Failed to delete tenant',
      reason: (error as Error).message,
    }
  }
}

const getTenantById = async (id: string) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id },
  })
  return tenant
}

const getTenantIdBySubdomain = async (subdomain: string) => {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    select: { id: true },
  })
  return tenant?.id
}

export const cachedGetTenant = async (tenantId: string) =>
  unstable_cache(getTenantById, ['tenant', tenantId], {
    tags: [await getTenantRelationTag('tenant', tenantId)],
  })(tenantId)

export const cachedGetTenantId = async (tenantSubdomain: string) =>
  unstable_cache(getTenantIdBySubdomain, ['tenant-id', tenantSubdomain], {
    tags: [await getTenantRelationTag('tenant-id', tenantSubdomain)],
  })(tenantSubdomain)

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
