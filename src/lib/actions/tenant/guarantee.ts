'use server'
import { Guarantee } from '@prisma/client'
import { z } from 'zod'

import { requireTenantId } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'

import { uploadFile, uploadFiles } from '../file'
import { guaranteeSchema } from './schemas'

export type GuaranteeInput = z.infer<typeof guaranteeSchema>

export type GuaranteeWithRelations = Awaited<ReturnType<typeof createGuarantee>>

export async function createGuarantee(data: GuaranteeInput) {
  const { tenantId } = await requireTenantId()
  try {
    const uploadedFiles = await uploadFiles(data.supportingDocs as File[])
    const guarantee = await prisma.guarantee.create({
      data: {
        type: data.type,
        amount: data.amount,
        supportingDocs: uploadedFiles,
        personId: data.personId,
        propertyId: data.propertyId,
        companyId: data.companyId,
        tenantId,
        contractId: data.contractId,
        status: 'PENDING',
      },
      include: {
        property: true,
        person: true,
        company: true,
      },
    })
    return guarantee
  } catch (error) {
    console.error('Error creating guarantee:', error)
    throw error
  }
}

export async function updateGuarantee(
  id: string,
  data: Partial<GuaranteeInput>,
) {
  const { tenantId } = await requireTenantId()
  try {
    const supportingDocs = await Promise.all(
      data.supportingDocs?.map(async (doc) =>
        doc instanceof File ? await uploadFile(doc) : doc,
      ) || [],
    )
    const guarantee = await prisma.guarantee.update({
      where: { id, tenantId },
      data: {
        type: data.type,
        amount: data.amount,
        supportingDocs,
        personId: data.personId,
        propertyId: data.propertyId,
        companyId: data.companyId,
        contractId: data.contractId,
      },
      include: {
        property: true,
        person: true,
        company: true,
      },
    })
    return guarantee
  } catch (error) {
    console.error('Error updating guarantee:', error)
    throw error
  }
}

export async function getGuarantee(id: string): Promise<Guarantee | null> {
  try {
    const guarantee = await prisma.guarantee.findUnique({
      where: { id },
    })
    return guarantee
  } catch (error) {
    console.error('Error getting guarantee:', error)
    throw error
  }
}

export async function deleteGuarantee(id: string): Promise<void> {
  try {
    await prisma.guarantee.delete({
      where: { id },
    })
  } catch (error) {
    console.error('Error deleting guarantee:', error)
    throw error
  }
}
