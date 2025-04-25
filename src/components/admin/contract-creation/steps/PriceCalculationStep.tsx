import { zodResolver } from '@hookform/resolvers/zod'
import { Currency, Index, PriceCalculation } from '@prisma/client'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/forms/Checkbox'
import { Input } from '@/components/ui/forms/Input'
import { Select } from '@/components/ui/forms/Select'
import { getCurrencies } from '@/lib/actions/tenant/currency'
import { getIndexes } from '@/lib/actions/tenant/index'
import {
  createPriceCalculation,
  updatePriceCalculation,
} from '@/lib/actions/tenant/price-calculation'
import { priceCalculationSchema } from '@/lib/actions/tenant/schemas'

interface PriceCalculationStepProps {
  priceCalculation: PriceCalculation | null
  setPriceCalculation: (priceCalculation: PriceCalculation | null) => void
}

interface PriceCalculationForm {
  name: string
  updatePeriod: number
  initialPrice: number
  currentPrice: number
  fixedAmount: number
  fixedPercentage: number
  historyValues: { value: number; date: Date }[]
  currencyLock: boolean
  indexId?: string
  currencyId?: string
}

export const PriceCalculationStep = ({
  priceCalculation,
  setPriceCalculation,
}: PriceCalculationStepProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [indexes, setIndexes] = useState<Index[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])

  const methods = useForm<PriceCalculationForm>({
    defaultValues: {
      name: priceCalculation?.name || '',
      updatePeriod: priceCalculation?.updatePeriod || 12,
      initialPrice: priceCalculation?.initialPrice || 0,
      currentPrice: priceCalculation?.currentPrice || 0,
      fixedAmount: priceCalculation?.fixedAmount || 0,
      historyValues:
        (priceCalculation?.historyValues as unknown as {
          value: number
          date: Date
        }[]) || [],
      fixedPercentage: priceCalculation?.fixedPercentage || 0,
      currencyLock: priceCalculation?.currencyLock || false,
      indexId: priceCalculation?.indexId || undefined,
      currencyId: priceCalculation?.currencyId || undefined,
    },
    resolver: zodResolver(priceCalculationSchema),
  })

  const {
    handleSubmit,
    formState: { errors },
    reset,
  } = methods

  const loadIndexes = async () => {
    const result = await getIndexes()
    if (result.success && result.data) {
      setIndexes(result.data)
    }
  }

  const loadCurrencies = async () => {
    const result = await getCurrencies()
    if (result.success && result.data) {
      setCurrencies(result.data)
    }
  }

  useEffect(() => {
    loadIndexes()
    loadCurrencies()
  }, [])

  const onSubmit = async (data: PriceCalculationForm) => {
    setIsLoading(true)
    try {
      const result = priceCalculation?.id
        ? await updatePriceCalculation({ id: priceCalculation.id, data })
        : await createPriceCalculation({
            data: {
              ...data,
              currentPrice: data.initialPrice,
            },
          })

      if (result.success && result.data) {
        setPriceCalculation(result.data)
        reset()
      }
    } catch (error) {
      console.error('Error creating price calculation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <h3 className="text-lg my-4 font-medium">Price Calculation</h3>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 p-4 border rounded-lg"
      >
        <Input
          name="name"
          registerOptions={{ required: 'Name is required' }}
          label="Name"
          error={errors.name?.message}
        />
        <Input
          name="initialPrice"
          registerOptions={{
            required: 'Initial price is required',
            min: { value: 0, message: 'Price must be positive' },
          }}
          label="Initial Price"
          type="number"
          error={errors.initialPrice?.message}
        />
        <Input
          name="updatePeriod"
          registerOptions={{
            required: 'Update period is required',
            min: {
              value: 1,
              message: 'Update period must be at least 1 month',
            },
          }}
          label="Update Period (months)"
          type="number"
          error={errors.updatePeriod?.message}
        />
        <Input
          name="fixedAmount"
          registerOptions={{
            min: { value: 0, message: 'Fixed amount must be positive' },
          }}
          label="Fixed Amount Adjustment"
          type="number"
          error={errors.fixedAmount?.message}
        />
        <Input
          name="fixedPercentage"
          registerOptions={{
            min: { value: 0, message: 'Percentage must be positive' },
          }}
          label="Fixed Percentage Adjustment"
          type="number"
          error={errors.fixedPercentage?.message}
        />
        <Select
          label="Index"
          name="indexId"
          options={[
            { value: '', label: 'None' },
            ...indexes.map((index) => ({
              value: index.id,
              label: `${index.name} (${index.currentValue}%)`,
            })),
          ]}
        />
        <Select
          label="Currency"
          name="currencyId"
          options={[
            { value: '', label: 'None' },
            ...currencies.map((currency) => ({
              value: currency.id,
              label: `${currency.name} ($${currency.valueInPesos})`,
            })),
          ]}
        />
        <Checkbox
          id="currencyLock"
          name="currencyLock"
          label="Lock Currency Conversion"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Price Calculation'}
        </Button>
      </form>

      {priceCalculation && (
        <div className="p-4 border rounded-lg space-y-2">
          <h4 className="font-medium">Selected Price Calculation</h4>
          <p>Name: {priceCalculation.name}</p>
          <p>Initial Price: {priceCalculation.initialPrice}</p>
          <p>Current Price: {priceCalculation.currentPrice}</p>
          <p>Update Period: {priceCalculation.updatePeriod} months</p>
          {priceCalculation.fixedAmount && (
            <p>Fixed Amount: {priceCalculation.fixedAmount}</p>
          )}
          {priceCalculation.fixedPercentage && (
            <p>Fixed Percentage: {priceCalculation.fixedPercentage}%</p>
          )}
          {priceCalculation.indexId && (
            <p>
              Index:{' '}
              {indexes.find((i) => i.id === priceCalculation.indexId)?.name}
            </p>
          )}{' '}
          {priceCalculation.currencyId && (
            <p>
              Currency:{' '}
              {
                currencies.find((c) => c.id === priceCalculation.currencyId)
                  ?.name
              }
            </p>
          )}
        </div>
      )}
    </FormProvider>
  )
}
