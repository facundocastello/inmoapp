'use server'

import { revalidatePath } from 'next/cache'

import { requireTenantId } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'

import { PriceCalculationForm, priceCalculationSchema } from './schemas'

export async function createPriceCalculation({
  data,
}: {
  data: PriceCalculationForm
}) {
  try {
    const { tenantId } = await requireTenantId()
    const validatedData = priceCalculationSchema.parse(data)

    const priceCalculation = await prisma.priceCalculation.create({
      data: {
        ...validatedData,
        tenantId,
      },
    })

    revalidatePath('/admin/contract/settings')
    return { success: true, data: priceCalculation }
  } catch (error) {
    console.error('Error creating price calculation:', error)
    return { success: false, error: 'Failed to create price calculation' }
  }
}

export async function updatePriceCalculation({
  id,
  data,
}: {
  id: string
  data: Partial<PriceCalculationForm>
}) {
  try {
    const { tenantId } = await requireTenantId()
    const validatedData = priceCalculationSchema.partial().parse(data)

    const priceCalculation = await prisma.priceCalculation.update({
      where: { id, tenantId },
      data: validatedData,
    })

    revalidatePath('/admin/contract/settings')
    return { success: true, data: priceCalculation }
  } catch (error) {
    console.error('Error updating price calculation:', error)
    return { success: false, error: 'Failed to update price calculation' }
  }
}

export async function deletePriceCalculation({ id }: { id: string }) {
  try {
    const { tenantId } = await requireTenantId()
    await prisma.priceCalculation.delete({
      where: { id, tenantId },
    })

    revalidatePath('/admin/contract/settings')
    return { success: true }
  } catch (error) {
    console.error('Error deleting price calculation:', error)
    return { success: false, error: 'Failed to delete price calculation' }
  }
}

export async function getPriceCalculation({ id }: { id: string }) {
  try {
    const { tenantId } = await requireTenantId()
    const priceCalculation = await prisma.priceCalculation.findUnique({
      where: { id, tenantId },
      include: {
        index: true,
        currency: true,
        contracts: true,
      },
    })

    return { success: true, data: priceCalculation }
  } catch (error) {
    console.error('Error fetching price calculation:', error)
    return { success: false, error: 'Failed to fetch price calculation' }
  }
}

export async function listPriceCalculations() {
  try {
    const { tenantId } = await requireTenantId()
    const priceCalculations = await prisma.priceCalculation.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        index: true,
        currency: true,
        _count: {
          select: { contracts: true },
        },
      },
    })

    return { success: true, data: priceCalculations }
  } catch (error) {
    console.error('Error listing price calculations:', error)
    return { success: false, error: 'Failed to list price calculations' }
  }
}

export async function updatePriceCalculationValue({
  id,
  value,
}: {
  id: string
  value: number
}) {
  try {
    const { tenantId } = await requireTenantId()
    const priceCalculation = await prisma.priceCalculation.findUnique({
      where: { id, tenantId },
    })

    if (!priceCalculation) {
      return { success: false, error: 'Price calculation not found' }
    }

    const historyValues = Array.isArray(priceCalculation.historyValues)
      ? priceCalculation.historyValues
      : []
    const updatedHistory = [...historyValues, { value, date: new Date() }]

    const updatedPriceCalculation = await prisma.priceCalculation.update({
      where: { id, tenantId },
      data: {
        currentPrice: value,
        historyValues: updatedHistory,
      },
    })

    revalidatePath('/admin/contract/settings')
    return { success: true, data: updatedPriceCalculation }
  } catch (error) {
    console.error('Error updating price calculation value:', error)
    return { success: false, error: 'Failed to update price calculation value' }
  }
}

function getHistoricalValue<T extends { value: number; date: string }>(
  history: T[],
  targetDate: Date,
): number | null {
  if (!history || history.length === 0) return null

  // Sort history by date in ascending order
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  // Find the first entry after the target date
  const nextEntryIndex = sortedHistory.findIndex(
    (entry) => new Date(entry.date).getTime() > targetDate.getTime(),
  )

  if (nextEntryIndex === 0) {
    // Target date is before first history entry
    return null
  }

  if (nextEntryIndex === -1) {
    // Target date is after all history entries, return the last value
    return sortedHistory[sortedHistory.length - 1].value
  }

  // Return the value from the entry before the next entry
  return sortedHistory[nextEntryIndex - 1].value
}

export async function calculateNewPrice({
  id,
  targetDate,
}: {
  id: string
  targetDate?: Date
}) {
  try {
    const { tenantId } = await requireTenantId()
    const priceCalculation = await prisma.priceCalculation.findUnique({
      where: { id, tenantId },
      include: {
        index: true,
        currency: true,
      },
    })

    if (!priceCalculation) {
      return { success: false, error: 'Price calculation not found' }
    }

    const now = targetDate || new Date()
    const createdAt = new Date(priceCalculation.createdAt)
    const monthsSinceCreation =
      (now.getFullYear() - createdAt.getFullYear()) * 12 +
      (now.getMonth() - createdAt.getMonth())

    // Get the last calculation date from history
    const historyValues = priceCalculation.historyValues as {
      value: number
      date: string
    }[]
    const lastCalculation =
      historyValues?.length > 0 ? historyValues[historyValues.length - 1] : null

    // If we have a last calculation, check if we need to update
    if (lastCalculation) {
      const lastCalculationDate = new Date(lastCalculation.date)
      const monthsSinceLastCalculation =
        (now.getFullYear() - lastCalculationDate.getFullYear()) * 12 +
        (now.getMonth() - lastCalculationDate.getMonth())

      // If we haven't reached the update period, return current price
      if (monthsSinceLastCalculation < priceCalculation.updatePeriod) {
        return {
          success: true,
          data: {
            ...priceCalculation,
            needsUpdate: false,
            nextUpdate: new Date(
              lastCalculationDate.setMonth(
                lastCalculationDate.getMonth() + priceCalculation.updatePeriod,
              ),
            ),
          },
        }
      }
    } else if (monthsSinceCreation < priceCalculation.updatePeriod) {
      // If no calculation history exists, check if we should update based on creation date
      return {
        success: true,
        data: {
          ...priceCalculation,
          needsUpdate: false,
          nextUpdate: new Date(
            createdAt.setMonth(
              createdAt.getMonth() + priceCalculation.updatePeriod,
            ),
          ),
        },
      }
    }

    let newPrice = priceCalculation.currentPrice

    // Apply index-based calculation if index is set
    if (priceCalculation.index) {
      const indexHistory = priceCalculation.index.historyValues as {
        value: number
        date: string
      }[]

      const indexValue = targetDate
        ? getHistoricalValue(indexHistory, targetDate) ||
          priceCalculation.index.currentValue
        : priceCalculation.index.currentValue

      if (!indexValue) {
        return {
          success: false,
          error: 'No valid index value found for the target date',
        }
      }

      // Find the last calculation date in index history
      const lastIndexUpdate =
        indexHistory?.length > 0 ? indexHistory[indexHistory.length - 1] : null

      if (lastIndexUpdate) {
        // Calculate cumulative change since last calculation
        const initialIndexValue = lastIndexUpdate.value
        const cumulativeChange =
          (indexValue - initialIndexValue) / initialIndexValue
        newPrice = priceCalculation.currentPrice * (1 + cumulativeChange)
      } else {
        // If no history, use current index value
        newPrice = priceCalculation.currentPrice * (indexValue / 100)
      }
    }

    // Apply fixed amount or percentage if set
    if (priceCalculation.fixedAmount) {
      newPrice += priceCalculation.fixedAmount
    }

    if (priceCalculation.fixedPercentage) {
      newPrice *= 1 + priceCalculation.fixedPercentage / 100
    }

    // Apply currency conversion if currency is set and not locked
    if (priceCalculation.currency && !priceCalculation.currencyLock) {
      const currencyHistory = priceCalculation.currency.historyValues as {
        value: number
        date: string
      }[]

      const currencyValue = targetDate
        ? getHistoricalValue(currencyHistory, targetDate) ||
          priceCalculation.currency.valueInPesos
        : priceCalculation.currency.valueInPesos

      if (!currencyValue) {
        return {
          success: false,
          error: 'No valid currency value found for the target date',
        }
      }

      newPrice *= currencyValue
    }

    // Only update the price calculation if we're not calculating for a historical date
    if (!targetDate) {
      const updatedPriceCalculation = await updatePriceCalculationValue({
        id,
        value: newPrice,
      })

      return {
        ...updatedPriceCalculation,
        data: {
          ...updatedPriceCalculation.data,
          needsUpdate: true,
          nextUpdate: new Date(
            new Date().setMonth(
              new Date().getMonth() + priceCalculation.updatePeriod,
            ),
          ),
        },
      }
    }

    return {
      success: true,
      data: {
        ...priceCalculation,
        currentPrice: newPrice,
        needsUpdate: false,
      },
    }
  } catch (error) {
    console.error('Error calculating new price:', error)
    return { success: false, error: 'Failed to calculate new price' }
  }
}
