'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { redirect } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/forms/Checkbox'
import { FileInput } from '@/components/ui/forms/FileInput'
import { Input } from '@/components/ui/forms/Input'
import { Textarea } from '@/components/ui/forms/Textarea'
import { createTenant, TenantTheme, updateTenant } from '@/lib/actions/tenant'

import { Tenant } from '.prisma/shared'

const tenantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subdomain: z.string().min(1, 'Subdomain is required'),
  description: z.string().optional().nullable(),
  logo: z
    .any()
    .refine((val) => {
      if (!val) return true // Allow null/undefined
      return val instanceof File || typeof val === 'string'
    }, 'Logo must be a File or string')
    .optional()
    .nullable(),
  isActive: z.boolean(),
})

export type TenantFormData = {
  name: string
  subdomain: string
  description?: string | null
  logo?: File | string | null | undefined
  isActive: boolean
  theme?: TenantTheme
  admin?: {
    name: string
    email: string
    password: string
  }
}

interface TenantFormProps {
  initialData?: Omit<
    Tenant,
    'createdAt' | 'updatedAt' | 'theme' | 'databaseName'
  >
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
          <FileInput
            name="logo"
            label="Logo"
            accept="image/*"
            error={errors.logo?.message?.toString()}
            defaultValue={initialData?.logo}
          />
        </div>

        <div>
          <Checkbox name="isActive" label="Active" />
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
