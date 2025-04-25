'use server'

import { revalidatePath } from 'next/cache'

import { requireTenantId } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import errorHandler from '@/lib/utils/error'

import { ContractForm } from './schemas'

export async function getContracts() {
  try {
    const { tenantId } = await requireTenantId()
    const contracts = await prisma.contract.findMany({
      where: { tenantId },
      orderBy: { startDate: 'desc' },
      include: {
        property: {
          include: {
            owner: true,
          },
        },
        occupant: true,
        applicant: true,
        contractType: true,
        priceCalculation: true,
        guarantees: true,
        paymentHistory: true,
      },
    })
    return { success: true, data: contracts }
  } catch (error) {
    return errorHandler(error, 'Failed to fetch contracts')
  }
}

export async function getContract({ id }: { id: string }) {
  try {
    const { tenantId } = await requireTenantId()
    const contract = await prisma.contract.findUnique({
      where: { id, tenantId },
      include: {
        occupant: true,
        applicant: true,
        property: {
          include: {
            owner: true,
          },
        },
        contractType: {
          include: {
            templates: true,
          },
        },
        priceCalculation: true,
        paymentMethod: true,
        guarantees: {
          include: {
            property: true,
            person: true,
            company: true,
          },
        },
        paymentHistory: true,
      },
    })
    if (!contract) {
      return { success: false, error: 'Contract not found' }
    }
    return { success: true, data: contract }
  } catch (error) {
    return errorHandler(error, 'Failed to fetch contract')
  }
}
export type ContractWithRelations = NonNullable<
  NonNullable<Awaited<ReturnType<typeof getContract>>>['data']
>

export async function createContract({ data }: { data: ContractForm }) {
  try {
    const { tenantId } = await requireTenantId()
    const contract = await prisma.contract.create({
      data: {
        ...data,
        tenantId,
      },
    })
    revalidatePath('/admin/contracts')
    return { success: true, data: contract }
  } catch (error) {
    return errorHandler(error, 'Failed to create contract')
  }
}

export async function updateContract({
  id,
  data,
}: {
  id: string
  data: Partial<ContractForm>
}) {
  try {
    const { tenantId } = await requireTenantId()
    const contract = await prisma.contract.update({
      where: { id, tenantId },
      data,
    })
    revalidatePath('/admin/contracts')
    return { success: true, data: contract }
  } catch (error) {
    return errorHandler(error, 'Failed to update contract')
  }
}

export async function appendGuarantee({
  id,
  guaranteeId,
}: {
  id: string
  guaranteeId: string
}) {
  try {
    const { tenantId } = await requireTenantId()
    const contract = await prisma.contract.update({
      where: { id, tenantId },
      data: { guarantees: { connect: { id: guaranteeId } } },
    })
    revalidatePath('/admin/contracts')
    return { success: true, data: contract }
  } catch (error) {
    return errorHandler(error, 'Failed to append guarantee')
  }
}

export async function deleteContract({ id }: { id: string }) {
  try {
    const { tenantId } = await requireTenantId()
    await prisma.contract.delete({
      where: { id, tenantId },
    })
    revalidatePath('/admin/contracts')
    return { success: true }
  } catch (error) {
    return errorHandler(error, 'Failed to delete contract')
  }
}

export async function searchContracts({ query }: { query: string }) {
  try {
    const { tenantId } = await requireTenantId()
    const contracts = await prisma.contract.findMany({
      where: {
        tenantId,
        OR: [
          { property: { address: { contains: query, mode: 'insensitive' } } },
        ],
      },
      take: 10,
    })
    return { success: true, data: contracts }
  } catch (error) {
    return errorHandler(error, 'Failed to search contracts')
  }
}

export async function listContracts(tenantId: string, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            include: {
              owner: true,
            },
          },
          contractType: true,
          priceCalculation: true,
        },
      }),
      prisma.contract.count({ where: { tenantId } }),
    ])

    return {
      success: true,
      data: contracts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    return errorHandler(error, 'Failed to list contracts')
  }
}

export async function updateContractStatus(
  id: string,
  status: 'PENDING' | 'ACTIVE' | 'TERMINATED' | 'EXPIRED' | 'CANCELLED',
) {
  try {
    const { tenantId } = await requireTenantId()
    const contract = await prisma.contract.update({
      where: { id, tenantId },
      data: { status },
    })

    revalidatePath('/admin/contracts')
    return { success: true, data: contract }
  } catch (error) {
    return errorHandler(error, 'Failed to update contract status')
  }
}
