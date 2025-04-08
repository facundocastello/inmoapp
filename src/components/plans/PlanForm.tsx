'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { redirect } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/forms/Input'
import { Textarea } from '@/components/ui/forms/Textarea'
import { createPlan, type PlanData, updatePlan } from '@/lib/actions/plans'

const planSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  features: z.object({
    maxUsers: z.number().min(1, 'Max users must be at least 1'),
    maxStorage: z.number().min(1, 'Max storage must be at least 1'),
    maxProjects: z.number().min(1, 'Max projects must be at least 1'),
    customDomain: z.boolean(),
    apiAccess: z.boolean(),
  }),
})

type FormData = z.infer<typeof planSchema>

interface PlanFormProps {
  initialData?: {
    id: string
    name: string
    description: string | null
    price: number
    features: Record<string, any>
  }
  isLoading?: boolean
}

export const PlanForm = ({ initialData, isLoading = false }: PlanFormProps) => {
  const methods = useForm<FormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      features: {
        maxUsers: initialData?.features.maxUsers || 1,
        maxStorage: initialData?.features.maxStorage || 100,
        maxProjects: initialData?.features.maxProjects || 1,
        customDomain: initialData?.features.customDomain || false,
        apiAccess: initialData?.features.apiAccess || false,
      },
    },
  })

  const {
    formState: { errors },
  } = methods

  const onSubmit = async (data: FormData) => {
    const planData: PlanData = {
      name: data.name,
      description: data.description,
      price: data.price,
      features: {
        maxUsers: data.features.maxUsers,
        maxStorage: data.features.maxStorage,
        maxProjects: data.features.maxProjects,
        customDomain: data.features.customDomain,
        apiAccess: data.features.apiAccess,
      },
    }

    let id = initialData?.id
    if (id) {
      await updatePlan(id, planData)
    } else {
      await createPlan(planData)
    }
    redirect('/super-admin/plans')
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.grid}>
          <div>
            <Input
              name="name"
              label="Name"
              error={errors.name?.message?.toString()}
            />
          </div>
          <div>
            <Input
              name="price"
              label="Price"
              type="number"
              error={errors.price?.message?.toString()}
            />
          </div>
        </div>

        <div>
          <Textarea
            name="description"
            label="Description"
            error={errors.description?.message?.toString()}
            rows={4}
          />
        </div>

        <div className={styles.features}>
          <h3 className={styles.featuresTitle}>Features</h3>
          <div className={styles.grid}>
            <div>
              <Input
                name="features.maxUsers"
                label="Max Users"
                type="number"
                error={errors.features?.maxUsers?.message?.toString()}
              />
            </div>
            <div>
              <Input
                name="features.maxStorage"
                label="Max Storage (MB)"
                type="number"
                error={errors.features?.maxStorage?.message?.toString()}
              />
            </div>
            <div>
              <Input
                name="features.maxProjects"
                label="Max Projects"
                type="number"
                error={errors.features?.maxProjects?.message?.toString()}
              />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? 'Update Plan' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

const styles = {
  form: 'space-y-6',
  grid: 'grid grid-cols-1 gap-6 sm:grid-cols-2',
  features: 'space-y-4',
  featuresTitle: 'text-lg font-medium',
  actions: 'flex justify-end',
}
