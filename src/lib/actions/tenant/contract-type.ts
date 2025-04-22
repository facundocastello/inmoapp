'use server'

import { revalidatePath } from 'next/cache'

import { requireTenantId } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'

import { ContractTypeForm } from './schemas'

export async function getContractTypes() {
  try {
    const { tenantId } = await requireTenantId()
    const contractTypes = await prisma.contractType.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    })
    return { success: true, data: contractTypes }
  } catch (error) {
    return { success: false, error: 'Failed to fetch contract types' }
  }
}

export async function getContractType({ id }: { id: string }) {
  try {
    const { tenantId } = await requireTenantId()
    const contractType = await prisma.contractType.findUnique({
      where: { id, tenantId },
    })
    if (!contractType) {
      return { success: false, error: 'Contract type not found' }
    }
    return { success: true, data: contractType }
  } catch (error) {
    return { success: false, error: 'Failed to fetch contract type' }
  }
}

export async function createContractType({ data }: { data: ContractTypeForm }) {
  try {
    const { tenantId } = await requireTenantId()
    const contractType = await prisma.contractType.create({
      data: {
        ...data,
        tenantId,
      },
    })
    revalidatePath('/admin/contract/settings')
    return { success: true, data: contractType }
  } catch (error) {
    return { success: false, error: 'Failed to create contract type' }
  }
}

export async function updateContractType({
  id,
  data,
}: {
  id: string
  data: Partial<ContractTypeForm>
}) {
  try {
    const { tenantId } = await requireTenantId()
    const contractType = await prisma.contractType.update({
      where: { id, tenantId },
      data,
    })
    revalidatePath('/admin/contract/settings')
    return { success: true, data: contractType }
  } catch (error) {
    return { success: false, error: 'Failed to update contract type' }
  }
}

export async function deleteContractType({ id }: { id: string }) {
  try {
    const { tenantId } = await requireTenantId()
    await prisma.contractType.delete({
      where: { id, tenantId },
    })
    revalidatePath('/admin/contract/settings')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete contract type' }
  }
}

export async function searchContractTypes({ query }: { query: string }) {
  try {
    const { tenantId } = await requireTenantId()
    const contractTypes = await prisma.contractType.findMany({
      where: {
        tenantId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    })
    return { success: true, data: contractTypes }
  } catch (error) {
    return { success: false, error: 'Failed to search contract types' }
  }
}
