'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { redirect } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/forms/Checkbox'
import { Input } from '@/components/ui/forms/Input'
import { Textarea } from '@/components/ui/forms/Textarea'
import {
  createTenant,
  type TenantFormData,
  updateTenant,
} from '@/lib/actions/tenant'

const tenantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subdomain: z.string().min(1, 'Subdomain is required'),
  description: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  isActive: z.boolean(),
  theme: z
    .object({
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
    })
    .optional()
    .nullable(),
})

interface TenantFormProps {
  initialData?: Partial<TenantFormData> & { id: string }
  isLoading?: boolean
}

export const TenantForm = ({
  initialData,
  isLoading = false,
}: TenantFormProps) => {
  const methods = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: '',
      subdomain: '',
      isActive: true,
      ...initialData,
    },
  })

  const {
    formState: { errors },
  } = methods

  const onSubmit = async (data: TenantFormData) => {
    let id = initialData?.id
    if (id) {
      await updateTenant(id, data)
    } else {
      const tenant = await createTenant(data)
      id = tenant.data?.id
    }
    redirect(`/super-admin/tenants`)
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
              name="subdomain"
              label="Subdomain"
              error={errors.subdomain?.message?.toString()}
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

        <div>
          <Input
            name="logo"
            label="Logo URL"
            error={errors.logo?.message?.toString()}
          />
        </div>

        <div>
          <Checkbox name="isActive" label="Active" />
        </div>

        <div className={styles.grid}>
          <div>
            <Input
              name="theme.primaryColor"
              label="Primary Color"
              error={errors.theme?.primaryColor?.message?.toString()}
            />
          </div>
          <div>
            <Input
              name="theme.secondaryColor"
              label="Secondary Color"
              error={errors.theme?.secondaryColor?.message?.toString()}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? 'Update Tenant' : 'Create Tenant'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

const styles = {
  form: 'space-y-6',
  grid: 'grid grid-cols-1 gap-6 sm:grid-cols-2',
  actions: 'flex justify-end',
}
