'use server'

import { revalidatePath } from 'next/cache'

import { requireTenantId } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import errorHandler from '@/lib/utils/error'

import { IndexForm } from './schemas'

export async function getIndexes() {
  try {
    const { tenantId } = await requireTenantId()
    const indexes = await prisma.index.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    })
    return { success: true, data: indexes }
  } catch (error) {
    return errorHandler(error, 'Failed to fetch indexes')
  }
}

export async function getIndex({ id }: { id: string }) {
  try {
    const { tenantId } = await requireTenantId()
    const index = await prisma.index.findUnique({
      where: { id, tenantId },
    })
    if (!index) {
      return { success: false, error: 'Index not found' }
    }
    return { success: true, data: index }
  } catch (error) {
    return errorHandler(error, 'Failed to fetch index')
  }
}

export async function createIndex({ data }: { data: IndexForm }) {
  try {
    const { tenantId } = await requireTenantId()
    const index = await prisma.index.create({
      data: {
        ...data,
        tenantId,
      },
    })
    revalidatePath('/admin/contract/settings')
    return { success: true, data: index }
  } catch (error) {
    return errorHandler(error, 'Failed to create index')
  }
}

export async function updateIndex({
  id,
  data,
}: {
  id: string
  data: Partial<IndexForm>
}) {
  try {
    const { tenantId } = await requireTenantId()
    const index = await prisma.index.update({
      where: { id, tenantId },
      data,
    })
    revalidatePath('/admin/contract/settings')
    return { success: true, data: index }
  } catch (error) {
    return errorHandler(error, 'Failed to update index')
  }
}

export async function deleteIndex({ id }: { id: string }) {
  try {
    const { tenantId } = await requireTenantId()
    await prisma.index.delete({
      where: { id, tenantId },
    })
    revalidatePath('/admin/contract/settings')
    return { success: true }
  } catch (error) {
    return errorHandler(error, 'Failed to delete index')
  }
}

export async function addIndexValue({
  id,
  value,
}: {
  id: string
  value: number
}) {
  try {
    const { tenantId } = await requireTenantId()
    const index = await prisma.index.findUnique({
      where: { id, tenantId },
    })
    if (!index) {
      return { success: false, error: 'Index not found' }
    }

    const historyValues = [
      ...(index.historyValues as { value: number; date: string }[]),
    ]
    historyValues.push({ value, date: new Date().toISOString() })

    const updatedIndex = await prisma.index.update({
      where: { id, tenantId },
      data: {
        currentValue: value,
        historyValues,
      },
    })
    revalidatePath('/admin/contract/settings')
    return { success: true, data: updatedIndex }
  } catch (error) {
    return errorHandler(error, 'Failed to add index value')
  }
}
