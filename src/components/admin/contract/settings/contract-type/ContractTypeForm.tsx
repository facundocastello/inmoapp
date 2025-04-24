'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { FormProvider } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/forms/Input'
import {
  createContractType,
  updateContractType,
} from '@/lib/actions/tenant/contract-type'
import {
  type ContractTypeForm as ContractTypeFormType,
  contractTypeSchema,
} from '@/lib/actions/tenant/schemas'

interface ContractTypeFormProps {
  initialData?: {
    id: string
    name: string
    description?: string
  }
}

export function ContractTypeForm({ initialData }: ContractTypeFormProps) {
  const router = useRouter()
  const form = useForm<ContractTypeFormType>({
    resolver: zodResolver(contractTypeSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  })

  const onSubmit = async (data: ContractTypeFormType) => {
    try {
      const result = initialData
        ? await updateContractType({
            id: initialData.id,
            data: {
              name: data.name,
              description: data.description,
            },
          })
        : await createContractType({
            data,
          })

      if (!result.success && 'error' in result) {
        throw new Error(result.error)
      }

      form.reset()
      router.refresh()
    } catch (error) {
      console.error('Error saving contract type:', error)
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mb-4 flex gap-4">
        <Input name="name" label="Contract Type Name" />
        <Input name="description" label="Description" />
        <Button type="submit">
          {initialData ? 'Update' : 'Add'} Contract Type
        </Button>
      </form>
    </FormProvider>
  )
}
