'use server'

import { requireTenantId } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import errorHandler from '@/lib/utils/error'

import { ContractTemplateForm } from './schemas'

export async function createContractTemplate({
  data: { contractTypeIds, ...data },
}: {
  data: ContractTemplateForm
}) {
  try {
    const { tenantId } = await requireTenantId()
    const contractTemplate = await prisma.contractTemplate.create({
      data: {
        ...data,
        tenantId,
        contractTypes: {
          connect: (contractTypeIds || []).map((id) => ({ id })),
        },
      },
    })
    return { success: true, data: contractTemplate }
  } catch (error) {
    return errorHandler(error, 'Failed to create contract template')
  }
}

export async function updateContractTemplate({
  id,
  data,
}: {
  id: string
  data: Partial<ContractTemplateForm>
}) {
  try {
    const { tenantId } = await requireTenantId()
    const contractTemplate = await prisma.contractTemplate.update({
      where: { id, tenantId },
      data,
    })
    return { success: true, data: contractTemplate }
  } catch (error) {
    return errorHandler(error, 'Failed to update contract type')
  }
}

export async function removeFromContractType({
  contractTypeId,
  templateId,
}: {
  contractTypeId: string
  templateId: string
}) {
  try {
    const { tenantId } = await requireTenantId()
    const contractTemplate = await prisma.contractTemplate.update({
      where: { id: templateId, tenantId },
      data: {
        contractTypes: {
          disconnect: { id: contractTypeId },
        },
      },
    })
    return { success: true, data: contractTemplate }
  } catch (error) {
    return errorHandler(
      error,
      'Failed to remove contract template from contract type',
    )
  }
}
