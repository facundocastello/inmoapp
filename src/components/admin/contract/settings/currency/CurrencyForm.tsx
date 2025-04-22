'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { FormProvider } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/forms/Input'
import { createCurrency, updateCurrency } from '@/lib/actions/tenant/currency'
import {
  type CurrencyForm as CurrencyFormType,
  currencySchema,
} from '@/lib/actions/tenant/schemas'

interface CurrencyFormProps {
  initialData?: {
    id: string
    type: string
    name: string
    description?: string
    valueInPesos: number
  }
}

export function CurrencyForm({ initialData }: CurrencyFormProps) {
  const router = useRouter()
  const form = useForm<CurrencyFormType>({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      type: initialData?.type || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      valueInPesos: initialData?.valueInPesos || 0,
      historyValues: [],
    },
  })

  const onSubmit = async (data: CurrencyFormType) => {
    try {
      const result = initialData
        ? await updateCurrency({
            id: initialData.id,
            data: {
              type: data.type,
              name: data.name,
              description: data.description,
              valueInPesos: data.valueInPesos,
            },
          })
        : await createCurrency({
            data: {
              ...data,
              historyValues: [
                { value: data.valueInPesos, date: new Date().toISOString() },
              ],
            },
          })

      if (!result.success) {
        throw new Error(result.error)
      }

      form.reset()
      router.refresh()
    } catch (error) {
      console.error('Error saving currency:', error)
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mb-4 flex gap-4">
        <Input name="type" label="Currency Type" />
        <Input name="name" label="Currency Name" />
        <Input name="description" label="Description" />
        <Input name="valueInPesos" label="Value in Pesos" type="number" />
        <Button type="submit">{initialData ? 'Update' : 'Add'} Currency</Button>
      </form>
    </FormProvider>
  )
}
