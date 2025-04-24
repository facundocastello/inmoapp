'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { FormProvider } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/forms/Checkbox'
import { Input } from '@/components/ui/forms/Input'
import { Select } from '@/components/ui/forms/Select'
import { createIndex, updateIndex } from '@/lib/actions/tenant/index'
import { type IndexForm, indexSchema } from '@/lib/actions/tenant/schemas'

interface IndexFormProps {
  initialData?: {
    id: string
    name: string
    currentValue: number
    updateFrequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
    source: 'MANUAL' | 'AUTOMATIC'
    isActive: boolean
  }
}

export function IndexForm({ initialData }: IndexFormProps) {
  const router = useRouter()
  const form = useForm<IndexForm>({
    resolver: zodResolver(indexSchema),
    defaultValues: {
      name: initialData?.name || '',
      currentValue: initialData?.currentValue || 0,
      updateFrequency: initialData?.updateFrequency || 'MONTHLY',
      source: initialData?.source || 'MANUAL',
      isActive: initialData?.isActive ?? true,
      historyValues: [],
    },
  })

  const onSubmit = async (data: IndexForm) => {
    try {
      const result = initialData
        ? await updateIndex({
            id: initialData.id,
            data: {
              name: data.name,
              currentValue: data.currentValue,
              updateFrequency: data.updateFrequency,
              source: data.source,
              isActive: data.isActive,
            },
          })
        : await createIndex({
            data: {
              ...data,
              historyValues: [
                { value: data.currentValue, date: new Date().toISOString() },
              ],
            },
          })

      if (!result.success && 'error' in result) {
        throw new Error(result.error)
      }

      form.reset()
      router.refresh()
    } catch (error) {
      console.error('Error saving index:', error)
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mb-4 flex gap-4">
        <Input name="name" label="Index Name" />
        <Input name="currentValue" label="Current Value" type="number" />
        <Select
          name="updateFrequency"
          label="Update Frequency"
          options={[
            { value: 'MONTHLY', label: 'Monthly' },
            { value: 'QUARTERLY', label: 'Quarterly' },
            { value: 'YEARLY', label: 'Yearly' },
          ]}
        />
        <Select
          name="source"
          label="Source"
          options={[
            { value: 'MANUAL', label: 'Manual' },
            { value: 'AUTOMATIC', label: 'Automatic' },
          ]}
        />
        <Checkbox name="isActive" label="Active" />
        <Button type="submit">{initialData ? 'Update' : 'Add'} Index</Button>
      </form>
    </FormProvider>
  )
}
