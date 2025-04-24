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
    })
    if (!contract) {
      return { success: false, error: 'Contract not found' }
    }
    return { success: true, data: contract }
  } catch (error) {
    return errorHandler(error, 'Failed to fetch contract')
  }
}

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
              occupant: true,
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
    console.error('Error listing contracts:', error)
    return { success: false, error: 'Failed to list contracts' }
  }
}

export async function updateContractStatus(
  tenantId: string,
  id: string,
  status: 'PENDING' | 'ACTIVE' | 'TERMINATED' | 'EXPIRED' | 'CANCELLED',
) {
  try {
    const contract = await prisma.contract.update({
      where: { id, tenantId },
      data: { status },
    })

    revalidatePath('/admin/contracts')
    return { success: true, data: contract }
  } catch (error) {
    console.error('Error updating contract status:', error)
    return { success: false, error: 'Failed to update contract status' }
  }
}

export async function addGuaranteeToContract(
  tenantId: string,
  contractId: string,
  guaranteeData: {
    type: string
    amount: number
    personId: string
    currencyId: string
    paymentMethodId: string
    guarantorRelation?: string
    expirationDate?: string
    supportingDocs?: string
  },
) {
  try {
    const guarantee = await prisma.guarantee.create({
      data: {
        ...guaranteeData,
        tenantId,
        contractId,
        status: 'PENDING',
      },
    })

    revalidatePath('/admin/contracts')
    return { success: true, data: guarantee }
  } catch (error) {
    console.error('Error adding guarantee to contract:', error)
    return { success: false, error: 'Failed to add guarantee to contract' }
  }
}

export async function removeGuaranteeFromContract(
  tenantId: string,
  guaranteeId: string,
) {
  try {
    await prisma.guarantee.delete({
      where: { id: guaranteeId },
    })

    revalidatePath('/admin/contracts')
    return { success: true }
  } catch (error) {
    console.error('Error removing guarantee from contract:', error)
    return { success: false, error: 'Failed to remove guarantee from contract' }
  }
}

export async function addPaymentToContract(
  tenantId: string,
  contractId: string,
  paymentData: {
    amount: number
    personId: string
    paymentMethodId: string
    paymentDate: string
    proofOfPayment?: string
  },
) {
  try {
    const payment = await prisma.paymentHistory.create({
      data: {
        ...paymentData,
        tenantId,
        contractId,
        status: 'COMPLETED',
      },
    })

    revalidatePath('/admin/contracts')
    return { success: true, data: payment }
  } catch (error) {
    console.error('Error adding payment to contract:', error)
    return { success: false, error: 'Failed to add payment to contract' }
  }
}
