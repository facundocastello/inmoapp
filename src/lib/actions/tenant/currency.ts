'use server'

import {
  requireTenantId,
  revalidateTenantSubdomainPath,
} from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import errorHandler from '@/lib/utils/error'

import { CurrencyForm } from './schemas'

export async function getCurrencies() {
  try {
    const { tenantId } = await requireTenantId()
    const currencies = await prisma.currency.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    })
    return { success: true, data: currencies }
  } catch (error) {
    return errorHandler(error, 'Failed to fetch currencies')
  }
}

export async function getCurrency({ id }: { id: string }) {
  try {
    const { tenantId } = await requireTenantId()
    const currency = await prisma.currency.findUnique({
      where: { id, tenantId },
    })
    if (!currency) {
      return { success: false, error: 'Currency not found' }
    }
    return { success: true, data: currency }
  } catch (error) {
    return errorHandler(error, 'Failed to fetch currency')
  }
}

export async function createCurrency({ data }: { data: CurrencyForm }) {
  try {
    const { tenantId } = await requireTenantId()
    const currency = await prisma.currency.create({
      data: {
        ...data,
        tenantId,
      },
    })
    revalidateTenantSubdomainPath('/admin/contract/settings')
    return { success: true, data: currency }
  } catch (error) {
    return errorHandler(error, 'Failed to create currency')
  }
}

export async function updateCurrency({
  id,
  data,
}: {
  id: string
  data: Partial<CurrencyForm>
}) {
  try {
    const { tenantId } = await requireTenantId()
    const currency = await prisma.currency.update({
      where: { id, tenantId },
      data,
    })
    revalidateTenantSubdomainPath('/admin/contract/settings')
    return { success: true, data: currency }
  } catch (error) {
    return errorHandler(error, 'Failed to update currency')
  }
}

export async function deleteCurrency({ id }: { id: string }) {
  try {
    const { tenantId } = await requireTenantId()
    await prisma.currency.delete({
      where: { id, tenantId },
    })
    revalidateTenantSubdomainPath('/admin/contract/settings')
    return { success: true }
  } catch (error) {
    return errorHandler(error, 'Failed to delete currency')
  }
}

export async function listCurrencies() {
  try {
    const { tenantId } = await requireTenantId()
    const currencies = await prisma.currency.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            priceCalculations: true,
          },
        },
      },
    })

    return { success: true, data: currencies }
  } catch (error) {
    console.error('Error listing currencies:', error)
    return { success: false, error: 'Failed to list currencies' }
  }
}

export async function searchCurrencies({ query }: { query: string }) {
  try {
    const { tenantId } = await requireTenantId()
    const currencies = await prisma.currency.findMany({
      where: {
        tenantId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { type: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    })
    return { success: true, data: currencies }
  } catch (error) {
    return errorHandler(error, 'Failed to search currencies')
  }
}

export async function addCurrencyValue({
  id,
  value,
}: {
  id: string
  value: number
}) {
  try {
    const { tenantId } = await requireTenantId()
    const currency = await prisma.currency.findUnique({
      where: { id, tenantId },
    })

    if (!currency) {
      return { success: false, error: 'Currency not found' }
    }

    const historyValues = Array.isArray(currency.historyValues)
      ? currency.historyValues
      : []
    const updatedHistory = [...historyValues, { value, date: new Date() }]

    const updatedCurrency = await prisma.currency.update({
      where: { id, tenantId },
      data: {
        valueInPesos: value,
        historyValues: updatedHistory,
      },
    })

    revalidateTenantSubdomainPath('/admin/contract/settings')
    return { success: true, data: updatedCurrency }
  } catch (error) {
    console.error('Error updating currency value:', error)
    return { success: false, error: 'Failed to update currency value' }
  }
}
